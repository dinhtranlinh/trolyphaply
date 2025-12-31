import { NextRequest, NextResponse } from 'next/server';
import { getAllPages, getPagesStats } from '@/lib/facebook/pagesService';

/**
 * Pages List Endpoint
 * GET /api/facebook/pages
 * 
 * Get all managed Facebook pages
 */
export async function GET(request: NextRequest) {
  try {
    // Get query params
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    // Get all pages
    let pages = await getAllPages();
    
    // Filter if requested
    if (activeOnly) {
      pages = pages.filter(p => p.automation_enabled);
    }
    
    // Get stats
    const stats = await getPagesStats();
    
    // Return without decrypted tokens
    const pagesPublic = pages.map(page => ({
      id: page.id,
      page_id: page.page_id,
      page_name: page.page_name,
      category: page.category,
      automation_enabled: page.automation_enabled,
      status: page.status,
      last_sync_at: page.last_sync_at,
      created_at: page.created_at,
      updated_at: page.updated_at
    }));
    
    return NextResponse.json({
      success: true,
      pages: pagesPublic,
      stats
    });
  } catch (error: any) {
    console.error('[Pages API] GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
