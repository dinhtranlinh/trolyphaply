import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/check-auth
 * Check if user is authenticated as admin
 */
export async function GET(request: NextRequest) {
  try {
    // For now, always return authenticated
    // TODO: Implement proper session check
    return NextResponse.json({ 
      success: true,
      authenticated: true 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
