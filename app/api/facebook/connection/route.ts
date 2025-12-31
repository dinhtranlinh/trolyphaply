import { NextRequest, NextResponse } from 'next/server';
import {
  getConnection,
  verifyToken,
  hasRequiredPermissions,
  saveUserToken,
  deleteConnection,
  extendTokenIfNeeded
} from '@/lib/facebook/tokenManager';

/**
 * Connection Status Endpoint
 * GET /api/facebook/connection
 * 
 * Returns current Facebook connection status
 */
export async function GET(request: NextRequest) {
  try {
    const connection = await getConnection();
    
    if (!connection) {
      return NextResponse.json({
        success: true,
        connected: false,
        connection: null
      });
    }

    const extendResult = await extendTokenIfNeeded();
    const refreshedConnection = await getConnection();
    const activeConnection = refreshedConnection || connection;
    
    // Verify token is still valid
    const tokenInfo = await verifyToken(activeConnection.page_access_token);
    
    // Check if token needs extension (disabled for now - requires app secret)
    // const extendResult = await extendTokenIfNeeded();
    
    return NextResponse.json({
      success: true,
      connected: true,
      connection: {
        id: connection.id,
        user_id: tokenInfo.user_id, // Get from live verification
        tokenType: connection.tokenType,
        expiresAt: activeConnection.expiresAt,
        isValid: tokenInfo.isValid,
        scopes: activeConnection.scopes,
        created_at: activeConnection.created_at,
        extended: extendResult?.extended || false
      }
    });
  } catch (error: any) {
    console.error('[Connection API] GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Save Connection Endpoint
 * POST /api/facebook/connection
 * 
 * Save Facebook user access token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Connection API] POST - Save token request');
    
    const { accessToken } = body;
    
    if (!accessToken || typeof accessToken !== 'string') {
      console.error('[Connection API] Invalid page_access_token:', typeof accessToken);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing or invalid accessToken parameter' 
        },
        { status: 400 }
      );
    }
    
    console.log('[Connection API] Saving token...');
    
    // Save token (will verify and check permissions)
    const result = await saveUserToken(accessToken);
    
    console.log('[Connection API] Save result:', result);
    
    if (!result.success) {
      console.error('[Connection API] Save failed:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        },
        { status: 400 }
      );
    }
    
    // Get updated connection info
    const connection = await getConnection();
    
    console.log('[Connection API] Token saved successfully');
    
    return NextResponse.json({
      success: true,
      message: '✅ Facebook connection saved successfully',
      connection: connection ? {
        id: connection.id,
        user_id: connection.user_id,
        expiresAt: connection.expiresAt,
        scopes: connection.scopes
      } : null
    });
  } catch (error: any) {
    console.error('[Connection API] POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Delete Connection Endpoint
 * DELETE /api/facebook/connection
 * 
 * Revoke and delete Facebook connection
 */
export async function DELETE(request: NextRequest) {
  try {
    const result = await deleteConnection();
    
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
      message: '✅ Facebook connection deleted successfully'
    });
  } catch (error: any) {
    console.error('[Connection API] DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
