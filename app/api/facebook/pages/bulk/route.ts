import { NextRequest, NextResponse } from 'next/server';
import { bulkUpdatePages } from '@/lib/facebook/pagesService';

/**
 * Bulk Pages Update Endpoint
 * POST /api/facebook/pages/bulk
 * 
 * Enable or disable multiple pages at once
 */
export async function POST(request: NextRequest) {
  try {
    const { ids, automation_enabled } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid ids parameter (array required)' 
        },
        { status: 400 }
      );
    }
    
    if (typeof automation_enabled !== 'boolean') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid automation_enabled parameter (boolean required)' 
        },
        { status: 400 }
      );
    }
    
    const result = await bulkUpdatePages(ids, automation_enabled);
    
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
      message: `✅ Updated ${result.updated} pages`,
      updated: result.updated
    });
  } catch (error: any) {
    console.error('[Pages Bulk API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
