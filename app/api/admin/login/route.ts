import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { comparePassword } from '@/lib/auth';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/admin/login
 * Admin authentication
 */
export async function POST(req: NextRequest) {
  console.log('\n🔐 [SERVER] ===== LOGIN REQUEST START =====');
  
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log('📧 [SERVER] Email:', email);
    console.log('🔑 [SERVER] Password length:', password?.length);

    // Validation
    if (!email || !password) {
      console.log('❌ [SERVER] Validation failed: Missing email or password');
      return NextResponse.json(
        { success: false, error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      );
    }

    // Fetch admin user
    console.log('🔍 [SERVER] Fetching admin from database...');
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, email, password')
      .eq('email', email)
      .single();

    if (error) {
      console.error('❌ [SERVER] Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    if (!admin) {
      console.log('❌ [SERVER] Admin not found in database');
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    console.log('✅ [SERVER] Admin found:', admin.email);
    console.log('🔐 [SERVER] Password hash from DB:', admin.password.substring(0, 20) + '...');

    // Verify password
    console.log('🔍 [SERVER] Comparing passwords...');
    const isValid = await comparePassword(password, admin.password);
    console.log('🔐 [SERVER] Password match:', isValid);

    if (!isValid) {
      console.log('❌ [SERVER] Password verification failed');
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    // Create session token
    const sessionToken = `admin_${admin.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log('🎫 [SERVER] Session token generated:', sessionToken.substring(0, 30) + '...');

    // Set cookie
    const cookieStore = await cookies();
    const cookieDomain = process.env.ADMIN_SESSION_COOKIE_DOMAIN;
    const cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'lax' | 'strict' | 'none';
      maxAge: number;
      path: string;
      domain?: string;
    } = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    };
    if (cookieDomain) {
      cookieOptions.domain = cookieDomain;
    }
    cookieStore.set('admin_session', sessionToken, cookieOptions);
    console.log('🍪 [SERVER] Cookie set successfully');

    // Store session in memory or database (for production, use Redis or database)
    // For now, we'll just return success with admin info and token
    const response = {
      success: true,
      token: sessionToken, // Add token for localStorage
      admin: {
        id: admin.id,
        email: admin.email,
      },
    };
    
    console.log('✅ [SERVER] Login successful! Returning response...');
    console.log('📤 [SERVER] Response:', { ...response, token: response.token.substring(0, 30) + '...' });
    console.log('🔐 [SERVER] ===== LOGIN REQUEST END =====\n');
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ [SERVER] Exception:', error);
    console.error('❌ [SERVER] Stack:', error.stack);
    return NextResponse.json(
      { success: false, error: 'Lỗi đăng nhập', details: error.message },
      { status: 500 }
    );
  }
}
