import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const APP_SECRET = process.env.FACEBOOK_APP_SECRET!;

/**
 * Facebook Data Deletion Callback
 * POST /api/facebook/data-deletion
 * 
 * This endpoint is called by Facebook when a user requests data deletion
 * from their Facebook settings.
 * 
 * Reference: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const signedRequest = params.get('signed_request');

    if (!signedRequest) {
      return NextResponse.json(
        { error: 'Missing signed_request' },
        { status: 400 }
      );
    }

    // Parse signed request
    const [encodedSig, payload] = signedRequest.split('.');
    
    // Decode payload
    const data = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );

    const userId = data.user_id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user_id in signed request' },
        { status: 400 }
      );
    }

    // Generate confirmation code
    const confirmationCode = crypto.randomBytes(16).toString('hex');

    console.log(`[Data Deletion] Request received for user: ${userId}`);

    // Delete user data from all tables
    // 1. Delete automation logs
    await supabase
      .from('automation_logs')
      .delete()
      .or(`metadata->user_id.eq.${userId}`);

    // 2. Delete webhook events related to this user
    await supabase
      .from('webhook_events')
      .delete()
      .or(`payload->sender->id.eq.${userId}`);

    // 3. Delete cooldown records
    await supabase
      .from('user_cooldowns')
      .delete()
      .eq('user_id', userId);

    // 4. If user owns pages, delete those connections
    // (This would require storing user_id in facebook_pages table)
    
    // 5. Log the deletion request
    await supabase
      .from('automation_logs')
      .insert({
        action_type: 'data_deletion',
        status: 'success',
        metadata: {
          user_id: userId,
          confirmation_code: confirmationCode,
          requested_at: new Date().toISOString()
        }
      });

    console.log(`[Data Deletion] Completed for user: ${userId}, code: ${confirmationCode}`);

    // Return response in format required by Facebook
    return NextResponse.json({
      url: `https://trolyphaply.vn/data-deletion?code=${confirmationCode}`,
      confirmation_code: confirmationCode
    });

  } catch (error: any) {
    console.error('[Data Deletion] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check deletion status
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'Missing confirmation code' },
      { status: 400 }
    );
  }

  // Look up the deletion request
  const { data, error } = await supabase
    .from('automation_logs')
    .select('*')
    .eq('action_type', 'data_deletion')
    .contains('metadata', { confirmation_code: code })
    .single();

  if (error || !data) {
    return NextResponse.json({
      found: false,
      message: 'Deletion request not found'
    });
  }

  return NextResponse.json({
    found: true,
    status: 'completed',
    requested_at: data.metadata?.requested_at,
    message: 'Your data has been deleted successfully'
  });
}
