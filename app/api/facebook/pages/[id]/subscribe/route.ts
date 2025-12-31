import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { subscribePageWebhooks, getPageSubscriptions, unsubscribePageWebhooks } from '@/lib/facebook/graphApi';
import { decryptToken } from '@/lib/facebook/tokenManager';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST: Subscribe a page to receive webhook events
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params;

    // Get page from database
    const { data: page, error: pageError } = await supabase
      .from('facebook_pages')
      .select('*')
      .eq('page_id', pageId)
      .single();

    if (pageError || !page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Decrypt page access token
    const pageAccessToken = decryptToken(page.page_access_token);

    // Subscribe to webhook events
    const result = await subscribePageWebhooks(
      pageId,
      pageAccessToken,
      ['feed', 'messages'] // Subscribe to feed (comments) and messages
    );

    if (result.success) {
      // Update page status in database
      await supabase
        .from('facebook_pages')
        .update({
          automation_enabled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('page_id', pageId);

      return NextResponse.json({
        success: true,
        message: `Page ${page.page_name} subscribed to webhooks`,
      });
    }

    return NextResponse.json(
      { error: 'Failed to subscribe page' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Subscribe page error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET: Check subscription status for a page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params;

    // Get page from database
    const { data: page, error: pageError } = await supabase
      .from('facebook_pages')
      .select('*')
      .eq('page_id', pageId)
      .single();

    if (pageError || !page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Decrypt page access token
    const pageAccessToken = decryptToken(page.page_access_token);

    // Get current subscriptions
    const subscriptions = await getPageSubscriptions(pageId, pageAccessToken);

    return NextResponse.json({
      success: true,
      page_id: pageId,
      page_name: page.page_name,
      subscriptions: subscriptions.data || [],
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Unsubscribe a page from webhooks
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params;

    // Get page from database
    const { data: page, error: pageError } = await supabase
      .from('facebook_pages')
      .select('*')
      .eq('page_id', pageId)
      .single();

    if (pageError || !page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Decrypt page access token
    const pageAccessToken = decryptToken(page.page_access_token);

    // Unsubscribe
    const result = await unsubscribePageWebhooks(pageId, pageAccessToken);

    if (result.success) {
      // Update page status
      await supabase
        .from('facebook_pages')
        .update({
          automation_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq('page_id', pageId);

      return NextResponse.json({
        success: true,
        message: `Page ${page.page_name} unsubscribed from webhooks`,
      });
    }

    return NextResponse.json(
      { error: 'Failed to unsubscribe page' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Unsubscribe page error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
