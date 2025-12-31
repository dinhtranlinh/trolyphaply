import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasRequiredPermissions } from '@/lib/facebook/tokenManager';

/**
 * Verify Token Endpoint
 * POST /api/facebook/connection/verify
 * 
 * Verify token validity and permissions without saving
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Verify Token API] Request body:', body);
    
    const { accessToken } = body;
    
    if (!accessToken || typeof accessToken !== 'string') {
      console.error('[Verify Token API] Invalid token:', { accessToken, type: typeof accessToken });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing or invalid accessToken parameter' 
        },
        { status: 400 }
      );
    }
    
    console.log('[Verify Token API] Verifying token...');
    
    // Verify token
    const tokenInfo = await verifyToken(accessToken);
    
    console.log('[Verify Token API] Token info:', tokenInfo);
    
    if (!tokenInfo.isValid) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: tokenInfo.error || 'Invalid token'
      });
    }
    
    // Check permissions
    const permCheck = hasRequiredPermissions(tokenInfo.scopes);
    
    return NextResponse.json({
      success: true,
      valid: true,
      tokenInfo: {
        isValid: tokenInfo.isValid,
        expiresAt: tokenInfo.expiresAt,
        user_id: tokenInfo.user_id,
        appId: tokenInfo.app_id,
        scopes: tokenInfo.scopes,
        hasRequiredPermissions: permCheck.valid,
        missingPermissions: permCheck.missing
      }
    });
  } catch (error: any) {
    console.error('[Connection Verify API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
