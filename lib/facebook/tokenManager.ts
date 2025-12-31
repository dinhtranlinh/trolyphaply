/**
 * Token Manager Service
 * Handle Facebook OAuth token encryption, verification, and lifecycle
 */

import { createClient } from '@supabase/supabase-js';
import { debugToken as debugTokenAPI, extendAccessToken as extendTokenAPI } from './graphApi';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Encryption key from environment (must be 32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.FACEBOOK_TOKEN_ENCRYPTION_KEY || 'default-key-change-in-production-32bytes';
const ALGORITHM = 'aes-256-cbc';
const GRAPH_API_VERSION = 'v24.0';
const SHORT_TOKEN_THRESHOLD_SECONDS = 2 * 24 * 60 * 60;

/**
 * Required Facebook permissions for automation
 */
const REQUIRED_PERMISSIONS = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'pages_messaging',
  'pages_manage_metadata'
];

export interface TokenInfo {
  isValid: boolean;
  expiresAt: Date | null;
  scopes: string[];
  user_id: string | null;
  app_id: string | null;
  error?: string;
}

interface DebugTokenData {
  is_valid: boolean;
  expires_at?: number;
  scopes?: string[];
  user_id?: string;
  app_id?: string;
}

/**
 * Encrypt access token before storing in database
 * Format: "iv:encrypted" (IV and encrypted text combined)
 */
export function encryptToken(token: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine IV and encrypted text
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error: any) {
    console.error('[TokenManager] Encryption error:', error);
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Decrypt access token from database
 * Expects format: "iv:encrypted"
 */
export function decryptToken(encryptedWithIv: string): string {
  try {
    const [ivHex, encrypted] = encryptedWithIv.split(':');
    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted token format');
    }
    
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error: any) {
    console.error('[TokenManager] Decryption error:', error);
    throw new Error('Failed to decrypt token');
  }
}

function getAppToken(): string | null {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) {
    return null;
  }
  return `${appId}|${appSecret}`;
}

async function debugTokenSafe(page_access_token: string): Promise<DebugTokenData | null> {
  const appToken = getAppToken();
  if (!appToken) {
    return null;
  }
  try {
    const result = await debugTokenAPI(page_access_token, appToken);
    return result?.data || null;
  } catch (error) {
    console.warn('[TokenManager] debug_token failed, falling back to /me:', error);
    return null;
  }
}

async function fetchPermissions(page_access_token: string): Promise<string[]> {
  try {
    const permResponse = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/me/permissions?access_token=${page_access_token}`
    );
    const permData = await permResponse.json();
    if (permData.data) {
      return permData.data
        .filter((p: any) => p.status === 'granted')
        .map((p: any) => p.permission);
    }
  } catch (error) {
    console.warn('[TokenManager] Could not fetch permissions:', error);
  }
  return [];
}

async function exchangeForLongLivedToken(page_access_token: string): Promise<{
  token: string;
  expiresAt: Date | null;
  exchanged: boolean;
}> {
  const debugData = await debugTokenSafe(page_access_token);
  if (debugData?.expires_at !== undefined) {
    if (debugData.expires_at === 0) {
      return { token: page_access_token, expiresAt: null, exchanged: false };
    }
    const expiresAt = new Date(debugData.expires_at * 1000);
    const secondsLeft = (expiresAt.getTime() - Date.now()) / 1000;
    if (secondsLeft > SHORT_TOKEN_THRESHOLD_SECONDS) {
      return { token: page_access_token, expiresAt, exchanged: false };
    }
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error('Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET for token exchange');
  }

  const extendResult = await extendTokenAPI(page_access_token, appId, appSecret);
  if (!extendResult || !extendResult.access_token) {
    throw new Error('Failed to exchange token for long-lived token');
  }

  const expiresAt = extendResult.expires_in
    ? new Date(Date.now() + extendResult.expires_in * 1000)
    : null;

  return {
    token: extendResult.access_token,
    expiresAt,
    exchanged: true
  };
}

/**
 * Verify token and get token info from Facebook
 */
export async function verifyToken(page_access_token: string): Promise<TokenInfo> {
  try {
    const debugData = await debugTokenSafe(page_access_token);
    if (debugData) {
      if (!debugData.is_valid) {
        return {
          isValid: false,
          expiresAt: null,
          scopes: [],
          user_id: null,
          app_id: null,
          error: 'Invalid token'
        };
      }

      return {
        isValid: true,
        expiresAt: debugData.expires_at ? new Date(debugData.expires_at * 1000) : null,
        scopes: debugData.scopes || [],
        user_id: debugData.user_id || null,
        app_id: debugData.app_id || null,
        error: undefined
      };
    }

    console.log('[TokenManager] Verifying token via /me endpoint...');
    
    // Call /me endpoint to verify token and get user info
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/me?fields=id,name&access_token=${page_access_token}`
    );
    
    const data = await response.json();
    
    if (data.error) {
      console.error('[TokenManager] Token verification failed:', data.error);
      return {
        isValid: false,
        expiresAt: null,
        scopes: [],
        user_id: null,
        app_id: null,
        error: data.error.message || 'Invalid token'
      };
    }
    
    // Token is valid if we got user data
    if (data.id) {
      console.log('[TokenManager] Token is valid, user:', data.name);
      
      // Get permissions by calling /me/permissions
      const scopes = await fetchPermissions(page_access_token);
      
      return {
        isValid: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Assume 60 days
        scopes: scopes,
        user_id: data.id,
        app_id: null, // Not available without debug_token
        error: undefined
      };
    }
    
    return {
      isValid: false,
      expiresAt: null,
      scopes: [],
      user_id: null,
      app_id: null,
      error: 'Invalid response from Facebook'
    };
  } catch (error: any) {
    console.error('[TokenManager] Token verification error:', error);
    return {
      isValid: false,
      expiresAt: null,
      scopes: [],
      user_id: null,
      app_id: null,
      error: error.message
    };
  }
}

/**
 * Check if token has all required permissions
 */
export function hasRequiredPermissions(scopes: string[]): {
  valid: boolean;
  missing: string[];
} {
  const missing = REQUIRED_PERMISSIONS.filter(perm => !scopes.includes(perm));
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Save user access token to database
 */
export async function saveUserToken(page_access_token: string): Promise<{
  success: boolean;
  connectionId?: string;
  error?: string;
}> {
  try {
    console.log('[TokenManager] saveUserToken called');
    
    const exchangeResult = await exchangeForLongLivedToken(page_access_token);
    const tokenToSave = exchangeResult.token;

    // Verify token (after exchange if needed)
    const tokenInfo = await verifyToken(tokenToSave);
    
    console.log('[TokenManager] Verification result:', {
      isValid: tokenInfo.isValid,
      user_id: tokenInfo.user_id
    });
    
    if (!tokenInfo.isValid) {
      return {
        success: false,
        error: tokenInfo.error || 'Invalid token'
      };
    }
    
    // Check permissions
    const permCheck = hasRequiredPermissions(tokenInfo.scopes);
    if (!permCheck.valid) {
      return {
        success: false,
        error: `Missing required permissions: ${permCheck.missing.join(', ')}`
      };
    }
    
    // Encrypt token
    const encryptedToken = encryptToken(tokenToSave);
    const expiresAt = tokenInfo.expiresAt || exchangeResult.expiresAt;
    
    console.log('[TokenManager] Encrypting token...');
    
    // Save to database (upsert - only one connection allowed)
    const { data, error } = await supabase
      .from('facebook_connection')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001', // Fixed UUID for single connection
        user_access_token: encryptedToken,
        token_expires_at: expiresAt?.toISOString() || null,
        scopes: tokenInfo.scopes,
        status: 'active',
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    console.log('[TokenManager] ✅ User token saved successfully');
    
    return {
      success: true,
      connectionId: data.id
    };
  } catch (error: any) {
    console.error('[TokenManager] Error saving token:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get current connection from database
 */
export async function getConnection(): Promise<{
  id: string;
  page_access_token: string;
  tokenType: string;
  expiresAt: Date | null;
  user_id: string | null;
  scopes: string[];
  created_at: Date;
} | null> {
  try {
    const { data, error } = await supabase
      .from('facebook_connection')
      .select('*')
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Decrypt token
    const page_access_token = decryptToken(data.user_access_token);
    
    return {
      id: data.id,
      page_access_token,
      tokenType: 'user', // Fixed - not in schema
      expiresAt: data.token_expires_at ? new Date(data.token_expires_at) : null,
      user_id: null, // Not stored in current schema
      scopes: data.scopes || [],
      created_at: new Date(data.created_at)
    };
  } catch (error: any) {
    console.error('[TokenManager] Error getting connection:', error);
    return null;
  }
}

/**
 * Extend short-lived token to long-lived token (60 days)
 */
export async function extendTokenIfNeeded(): Promise<{
  success: boolean;
  extended?: boolean;
  newExpiresAt?: Date;
  error?: string;
}> {
  try {
    const connection = await getConnection();
    
    if (!connection) {
      return {
        success: false,
        error: 'No connection found'
      };
    }
    
    // Check if token expires in < 7 days
    const now = new Date();
    const expiresAt = connection.expiresAt;
    
    if (!expiresAt) {
      // Token never expires (e.g., page token)
      return {
        success: true,
        extended: false
      };
    }
    
    const daysUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysUntilExpiry > 7) {
      // No need to extend yet
      return {
        success: true,
        extended: false
      };
    }
    
    console.log(`[TokenManager] Token expires in ${daysUntilExpiry.toFixed(1)} days, extending...`);
    
    // Extend token
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    if (!appId || !appSecret) {
      return {
        success: false,
        error: 'Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET for token extension'
      };
    }
    const extendResult = await extendTokenAPI(connection.page_access_token, appId, appSecret);
    
    if (!extendResult || !extendResult.access_token) {
      return {
        success: false,
        error: 'Failed to extend token'
      };
    }
    
    // Save new token
    const encryptedToken = encryptToken(extendResult.access_token);
    
    const newExpiresAt = new Date(now.getTime() + (extendResult.expires_in || 5184000) * 1000);
    
    await supabase
      .from('facebook_connection')
      .update({
        user_access_token: encryptedToken,
        token_expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', connection.id);
    
    console.log('[TokenManager] ✅ Token extended successfully');
    
    return {
      success: true,
      extended: true,
      newExpiresAt
    };
  } catch (error: any) {
    console.error('[TokenManager] Error extending token:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete connection from database
 */
export async function deleteConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Also delete all pages (cascade will delete rules, queue jobs, etc.)
    await supabase.from('facebook_pages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    await supabase.from('facebook_connection').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('[TokenManager] ✅ Connection deleted successfully');
    
    return { success: true };
  } catch (error: any) {
    console.error('[TokenManager] Error deleting connection:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
