import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { isDuplicate, recordEvent, generateDedupeKey } from '@/lib/facebook/dedupe';
import { enqueueJob } from '@/lib/facebook/queueService';

/**
 * Facebook Webhooks Endpoint
 * Handles both verification (GET) and event reception (POST)
 * 
 * Response time MUST be < 1 second to avoid Meta timeout
 */

const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN!;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET!;

// GET: Webhook Verification (Meta sends this when you click "Verify and Save")
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Meta sends these params:
    // hub.mode=subscribe
    // hub.verify_token=YOUR_VERIFY_TOKEN
    // hub.challenge=RANDOM_STRING
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('[Webhook Verification]', { mode, token: token?.slice(0, 10) + '...', challenge: challenge?.slice(0, 20) });

    // Check if mode and token are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully!');
      // Respond with challenge to confirm subscription
      return new NextResponse(challenge, { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    } else {
      console.error('❌ Webhook verification failed:', { mode, token_match: token === VERIFY_TOKEN });
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('❌ Webhook verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Receive Webhook Events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // TODO: Re-enable signature verification after getting correct FACEBOOK_APP_SECRET
    // Temporarily disabled for testing
    const SKIP_SIGNATURE_CHECK = !process.env.FACEBOOK_APP_SECRET;
    
    if (!SKIP_SIGNATURE_CHECK && !verifySignature(body, signature)) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }
    
    if (SKIP_SIGNATURE_CHECK) {
      console.warn('⚠️ Signature verification SKIPPED (FACEBOOK_APP_SECRET not set)');
    }

    const data = JSON.parse(body);
    console.log('[Webhook Event Received]', JSON.stringify(data, null, 2));

    // Process events
    if (data.object === 'page') {
      for (const entry of data.entry || []) {
        const page_id = entry.id;
        const time = entry.time;

        // Process changes (comments, feed, reactions, etc.)
        for (const change of entry.changes || []) {
          const field = change.field; // 'feed', 'comments', 'reactions', etc.
          const value = change.value;

          console.log(`📩 Event: ${field} on page ${page_id}`, value);

          // TODO: Process events based on field type
          // For now, just log to verify webhooks are working
          await processWebhookEvent(page_id, field, value, time);
        }
      }
    }

    // Always return 200 quickly (Meta expects response < 5s)
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

/**
 * Verify X-Hub-Signature-256 header
 */
function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) return false;

  try {
    const expectedSignature = 'sha256=' + 
      crypto
        .createHmac('sha256', APP_SECRET)
        .update(payload)
        .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Process webhook event - Queue for delayed processing
 * CRITICAL: Must complete < 1 second to avoid Meta timeout
 */
async function processWebhookEvent(
  page_id: string,
  field: string,
  value: any,
  timestamp: number
) {
  try {
    // Parse event data
    const eventData = parseWebhookEvent(field, value);
    if (!eventData) {
      console.log(`⏭️ Skipped unsupported event type: ${field}`);
      return;
    }

    const { eventType, post_id, comment_id, user_id, data } = eventData;

    // Skip self-comments from Page (don't reply to our own comments)
    if (user_id === page_id) {
      console.log(`⏭️ Skipped self-comment from page ${page_id}`);
      return;
    }

    // Skip comment removal events (only process new comments)
    if (data?.verb === 'remove' || data?.verb === 'edited') {
      console.log(`⏭️ Skipped ${data.verb} event for ${comment_id || post_id}`);
      return;
    }

    // Check deduplication
    const dedupeKey = generateDedupeKey({ page_id, eventType, post_id, comment_id, user_id, timestamp });
    const duplicate = await isDuplicate(dedupeKey);
    if (duplicate) {
      console.log(`🔄 Duplicate event ignored: ${eventType} ${comment_id || post_id}`);
      return;
    }

    // Record event in DB
    await recordEvent({ eventType, page_id, post_id, comment_id, user_id, dedupeKey, payload: data });

    // Enqueue job(s) for delayed processing
    const target_id = comment_id || post_id || user_id || 'unknown';
    const jobPayload = {
      eventType,
      post_id,
      comment_id,
      user_id,
      userInfo: data.from,
      userName: data.from?.name,
      originalMessage: data.message,
      metadata: data
    };

    // For comments: create BOTH reply job AND message job
    if (eventType.includes('reply') || eventType.includes('mention')) {
      // 1. Reply to comment
      await enqueueJob({
        jobType: 'reply_comment',
        page_id,
        target_id,
        payload: jobPayload
      });
      
      // 2. Also send inbox message (if message rules exist)
      await enqueueJob({
        jobType: 'send_message',
        page_id,
        target_id: user_id || target_id,
        payload: {
          ...jobPayload,
          triggerType: 'comment'
        }
      });
      
      console.log(`✅ Event queued (reply + message): ${eventType} ${comment_id || post_id}`);
    } else {
      // For reactions and other events: just message job
      await enqueueJob({
        jobType: 'send_message',
        page_id,
        target_id: user_id || target_id,
        payload: {
          ...jobPayload,
          triggerType: eventType.includes('reaction') ? 'reaction' : 'other'
        }
      });
      
      console.log(`✅ Event queued (message): ${eventType} ${comment_id || post_id}`);
    }

  } catch (error) {
    console.error('Error processing event:', error);
    // Don't throw - we already responded 200 to Meta
  }
}

/**
 * Parse webhook event into standardized format
 */
function parseWebhookEvent(field: string, value: any): {
  eventType: string;
  post_id?: string;
  comment_id?: string;
  user_id?: string;
  data: any;
} | null {
  try {
    // Comment on post (auto-reply trigger)
    if (field === 'feed' && value.item === 'comment') {
      return {
        eventType: 'comment_reply',
        post_id: value.post_id,
        comment_id: value.comment_id,
        user_id: value.from?.id,
        data: {
          from: value.from,
          message: value.message,
          verb: value.verb, // 'add', 'edit', 'remove'
          created_time: value.created_time
        }
      };
    }

    // Comment events (alternative format)
    if (field === 'comments' && value.verb === 'add') {
      return {
        eventType: 'comment_reply',
        post_id: value.post_id,
        comment_id: value.id,
        user_id: value.from?.id,
        data: {
          from: value.from,
          message: value.message,
          verb: value.verb,
          created_time: value.created_time
        }
      };
    }

    // Reaction on post (auto-message trigger)
    if (field === 'reactions' && value.verb === 'add') {
      return {
        eventType: 'reaction_message',
        post_id: value.post_id,
        user_id: value.from?.id,
        data: {
          from: value.from,
          reaction_type: value.reaction_type, // 'like', 'love', 'wow', etc.
          verb: value.verb,
          created_time: value.created_time
        }
      };
    }

    // Page message (inbox)
    if (field === 'messages' && value.message) {
      return {
        eventType: 'inbox_message',
        user_id: value.sender?.id,
        data: {
          from: value.sender,
          message: value.message,
          mid: value.mid,
          created_time: value.created_time
        }
      };
    }

    // Mention in comment
    if (field === 'mention' && value.item === 'comment') {
      return {
        eventType: 'mention_reply',
        post_id: value.post_id,
        comment_id: value.comment_id,
        user_id: value.from?.id,
        data: {
          from: value.from,
          message: value.message,
          created_time: value.created_time
        }
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing webhook event:', error);
    return null;
  }
}
