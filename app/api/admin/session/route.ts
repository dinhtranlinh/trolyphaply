import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/session
 * Check if admin is logged in
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session');

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }

    // In production, validate session token against database/Redis
    // For now, just check if token exists and is valid format
    if (!sessionToken.value.startsWith('admin_')) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi kiểm tra phiên', details: error.message },
      { status: 500 }
    );
  }
}
