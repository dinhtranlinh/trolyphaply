import { NextRequest, NextResponse } from 'next/server';
import { 
  startCronJobs, 
  stopCronJobs, 
  getCronJobStatus 
} from '@/lib/facebook/cronJobs';

/**
 * Cron Jobs Control Endpoint
 * GET /api/facebook/cron - Get status
 * POST /api/facebook/cron - Start/stop jobs
 * 
 * Control scheduled background tasks
 */
export async function GET(request: NextRequest) {
  try {
    const status = getCronJobStatus();

    return NextResponse.json({
      success: true,
      ...status
    });

  } catch (error: any) {
    console.error('[Cron Control GET] Error:', error);
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
    const { action } = await request.json();

    if (!action || !['start', 'stop'].includes(action)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid action. Use "start" or "stop"' 
        },
        { status: 400 }
      );
    }

    if (action === 'start') {
      startCronJobs();
      return NextResponse.json({
        success: true,
        message: 'Cron jobs started',
        status: getCronJobStatus()
      });
    } else {
      stopCronJobs();
      return NextResponse.json({
        success: true,
        message: 'Cron jobs stopped',
        status: getCronJobStatus()
      });
    }

  } catch (error: any) {
    console.error('[Cron Control POST] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
