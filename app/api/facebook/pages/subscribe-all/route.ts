import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { subscribePageWebhooks } from '@/lib/facebook/graphApi';
import { decryptToken } from '@/lib/facebook/tokenManager';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST: Subscribe ALL pages to receive webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get all pages from database
    const { data: pages, error: pagesError } = await supabase
      .from('facebook_pages')
      .select('*');

    if (pagesError || !pages || pages.length === 0) {
      return NextResponse.json(
        { error: 'No pages found' },
        { status: 404 }
      );
    }

    const results: Array<{
      page_id: string;
      page_name: string;
      success: boolean;
      error?: string;
    }> = [];

    // Subscribe each page
    for (const page of pages) {
      try {
        const pageAccessToken = decryptToken(page.page_access_token);
        
        const result = await subscribePageWebhooks(
          page.page_id,
          pageAccessToken,
          ['feed', 'messages']
        );

        if (result.success) {
          // Update page status
          await supabase
            .from('facebook_pages')
            .update({
              automation_enabled: true,
              updated_at: new Date().toISOString(),
            })
            .eq('page_id', page.page_id);

          results.push({
            page_id: page.page_id,
            page_name: page.page_name,
            success: true,
          });
        } else {
          results.push({
            page_id: page.page_id,
            page_name: page.page_name,
            success: false,
            error: 'Subscribe failed',
          });
        }
      } catch (error) {
        results.push({
          page_id: page.page_id,
          page_name: page.page_name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Subscribed ${successCount}/${pages.length} pages`,
      successCount,
      failCount,
      results,
    });
  } catch (error) {
    console.error('Subscribe all pages error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET: Get subscription status for all pages
 */
export async function GET(request: NextRequest) {
  try {
    const { getPageSubscriptions } = await import('@/lib/facebook/graphApi');

    // Get all pages from database
    const { data: pages, error: pagesError } = await supabase
      .from('facebook_pages')
      .select('*');

    if (pagesError || !pages || pages.length === 0) {
      return NextResponse.json(
        { error: 'No pages found' },
        { status: 404 }
      );
    }

    const results: Array<{
      page_id: string;
      page_name: string;
      automation_enabled: boolean;
      subscriptions: string[];
    }> = [];

    // Check each page
    for (const page of pages) {
      try {
        const pageAccessToken = decryptToken(page.page_access_token);
        const subs = await getPageSubscriptions(page.page_id, pageAccessToken);

        results.push({
          page_id: page.page_id,
          page_name: page.page_name,
          automation_enabled: page.automation_enabled || false,
          subscriptions: subs.data?.[0]?.subscribed_fields || [],
        });
      } catch (error) {
        results.push({
          page_id: page.page_id,
          page_name: page.page_name,
          automation_enabled: false,
          subscriptions: [],
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalPages: pages.length,
      results,
    });
  } catch (error) {
    console.error('Get all subscriptions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
