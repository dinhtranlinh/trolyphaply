import { NextRequest, NextResponse } from 'next/server';
import { getPageByDbId, updatePage, deletePage } from '@/lib/facebook/pagesService';
import { getPageSubscriptions, subscribePageWebhooks } from '@/lib/facebook/graphApi';

/**
 * Single Page Endpoint
 * GET /api/facebook/pages/[id] - Get page details
 * PATCH /api/facebook/pages/[id] - Update page
 * DELETE /api/facebook/pages/[id] - Delete page
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const page = await getPageByDbId(id);
    
    if (!page) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Page not found' 
        },
        { status: 404 }
      );
    }
    
    // Return without access token
    return NextResponse.json({
      success: true,
      page: {
        id: page.id,
        page_id: page.page_id,
        page_name: page.page_name,
        category: page.category,
        automation_enabled: page.automation_enabled,
        created_at: page.created_at,
        updated_at: page.updated_at
      }
    });
  } catch (error: any) {
    console.error('[Page API] GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    
    // Validate updates
    const allowedFields = ['automation_enabled', 'page_name'];
    const filteredUpdates: any = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }
    
    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No valid fields to update' 
        },
        { status: 400 }
      );
    }

    if (filteredUpdates.automation_enabled === true) {
      const page = await getPageByDbId(id);
      if (!page) {
        return NextResponse.json(
          {
            success: false,
            error: 'Page not found'
          },
          { status: 404 }
        );
      }

      if (!page.page_access_token) {
        return NextResponse.json(
          {
            success: false,
            error: 'Page access token missing. Please sync pages first.'
          },
          { status: 400 }
        );
      }

      let needsSubscribe = true;
      try {
        const subscriptions = await getPageSubscriptions(page.page_id, page.page_access_token);
        const subscribedFields = subscriptions.data?.[0]?.subscribed_fields || [];
        needsSubscribe = !subscribedFields.includes('feed');
      } catch (error) {
        console.warn('[Page API] Failed to read webhook subscriptions, will attempt subscribe:', error);
        needsSubscribe = true;
      }

      if (needsSubscribe) {
        const subscribeResult = await subscribePageWebhooks(
          page.page_id,
          page.page_access_token,
          ['feed', 'messages']
        );

        if (!subscribeResult.success) {
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to subscribe page webhooks'
            },
            { status: 500 }
          );
        }
      }
    }
    
    const result = await updatePage(id, filteredUpdates);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 500 }
      );
    }
    
    // Get updated page
    const page = await getPageByDbId(id);
    
    return NextResponse.json({
      success: true,
      message: '✅ Page updated successfully',
      page: page ? {
        id: page.id,
        page_id: page.page_id,
        page_name: page.page_name,
        automation_enabled: page.automation_enabled
      } : null
    });
  } catch (error: any) {
    console.error('[Page API] PATCH error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await deletePage(id);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '✅ Page deleted successfully'
    });
  } catch (error: any) {
    console.error('[Page API] DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
