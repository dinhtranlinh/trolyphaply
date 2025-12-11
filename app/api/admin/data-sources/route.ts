import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * GET /api/admin/data-sources
 * Get all data sources
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: sources, error } = await supabase
      .from('data_sources')
      .select('*')
      .order('priority');
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      data: sources 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
