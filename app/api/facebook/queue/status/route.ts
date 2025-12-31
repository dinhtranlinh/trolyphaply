import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Queue Status Endpoint
 * GET /api/facebook/queue/status
 * 
 * Returns queue statistics and recent jobs
 */
export async function GET(request: NextRequest) {
  try {
    // Count jobs by status
    const { data: statusCounts, error: countError } = await supabase
      .from('automation_queue')
      .select('status')
      .then(async (result) => {
        if (result.error) throw result.error;
        
        const counts = {
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
          total: result.data.length
        };

        result.data.forEach((job: any) => {
          counts[job.status as keyof typeof counts]++;
        });

        return { data: counts, error: null };
      });

    if (countError) throw countError;

    // Get recent jobs (last 20)
    const { data: recentJobs, error: jobsError } = await supabase
      .from('automation_queue')
      .select('id, job_type, page_id, status, scheduled_for, created_at, completed_at, attempt, error')
      .order('created_at', { ascending: false })
      .limit(20);

    if (jobsError) throw jobsError;

    // Get oldest pending job
    const { data: oldestPending, error: oldestError } = await supabase
      .from('automation_queue')
      .select('id, scheduled_for')
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true })
      .limit(1);

    if (oldestError) throw oldestError;

    return NextResponse.json({
      success: true,
      stats: statusCounts,
      recentJobs: recentJobs || [],
      oldestPending: oldestPending?.[0] || null,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Queue Status API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
