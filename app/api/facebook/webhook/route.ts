import { NextRequest, NextResponse } from 'next/server';

// GET: verify webhook
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const verifyToken = process.env.FB_VERIFY_TOKEN || 'trolyphaply-verify';

  if (mode === 'subscribe' && token && verifyToken && token === verifyToken) {
    return new NextResponse(challenge || '', { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// POST: receive webhook events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Only log in development to avoid leaking data in prod
    if (process.env.NODE_ENV !== 'production') {
      console.log('[FB Webhook] event:', JSON.stringify(body, null, 2));
    }

    // Acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[FB Webhook] error:', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
