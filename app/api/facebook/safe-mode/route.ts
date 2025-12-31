import { NextRequest, NextResponse } from 'next/server';
import { 
  getSafeModeStatus, 
  enableSafeMode, 
  disableSafeMode 
} from '@/lib/facebook/safeMode';

/**
 * Safe Mode Control Endpoint
 * GET /api/facebook/safe-mode - Get current status
 * POST /api/facebook/safe-mode - Toggle safe mode
 * 
 * Safe mode is a global kill-switch for all automation
 */
export async function GET(request: NextRequest) {
  try {
    const status = await getSafeModeStatus();

    return NextResponse.json({
      success: true,
      safeMode: status.enabled,
      reason: status.reason
    });

  } catch (error: any) {
    console.error('[Safe Mode GET] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { enable, reason, setBy = 'api' } = await request.json();

    if (typeof enable !== 'boolean') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing or invalid "enable" parameter (boolean required)' 
        },
        { status: 400 }
      );
    }

    if (enable) {
      await enableSafeMode(reason || `Enabled via API by ${setBy}`);
    } else {
      await disableSafeMode();
    }

    // Get updated status
    const status = await getSafeModeStatus();

    return NextResponse.json({
      success: true,
      safeMode: status.enabled,
      message: enable 
        ? '🛑 Safe mode ENABLED - All automation stopped'
        : '✅ Safe mode DISABLED - Automation resumed',
      reason: status.reason
    });

  } catch (error: any) {
    console.error('[Safe Mode POST] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
