import { NextRequest, NextResponse } from 'next/server';
import { syncPagesFromFacebook } from '@/lib/facebook/pagesService';
import { getConnection } from '@/lib/facebook/tokenManager';

/**
 * Sync Pages Endpoint
 * POST /api/facebook/pages/sync
 * 
 * Sync pages from Facebook /me/accounts
 */
export async function POST(request: NextRequest) {
  try {
    // Get current connection
    const connection = await getConnection();
    
    if (!connection) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No Facebook connection found. Please connect first.' 
        },
        { status: 400 }
      );
    }
    
    // Sync pages
    const result = await syncPagesFromFacebook(connection.page_access_token, connection.id);
    
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
      message: `✅ Synced ${result.synced} pages from Facebook`,
      synced: result.synced,
      pages: result.pages?.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category
      })) || []
    });
  } catch (error: any) {
    console.error('[Pages Sync API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
