import { NextRequest, NextResponse } from 'next/server';
import { getPendingJobs, markJobProcessing } from '@/lib/facebook/queueService';
import { processReplyJob, processMessageJob } from '@/lib/facebook/automationEngine';

/**
 * Manual Queue Processing Endpoint
 * POST /api/facebook/queue/process
 * 
 * Triggers immediate processing of pending jobs
 * Useful for testing or manual intervention
 */
export async function POST(request: NextRequest) {
  try {
    const { limit = 10 } = await request.json().catch(() => ({}));

    // Get pending jobs
    const jobs = await getPendingJobs(limit);
    
    if (jobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending jobs to process',
        processed: 0
      });
    }

    // Process each job
    const results = [];
    for (const job of jobs) {
      try {
        // Mark as processing
        await markJobProcessing(job.id);

        // Process based on type
        let result;
        if (job.jobType === 'reply_comment') {
          result = await processReplyJob(job);
        } else if (job.jobType === 'send_message') {
          result = await processMessageJob(job);
        } else {
          result = { success: false, reason: 'Unknown job type' };
        }

        results.push({
          jobId: job.id,
          type: job.jobType,
          ...result
        });

      } catch (error: any) {
        console.error(`Error processing job ${job.id}:`, error);
        results.push({
          jobId: job.id,
          type: job.jobType,
          success: false,
          reason: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      processed: jobs.length,
      successful: successCount,
      failed: failCount,
      details: results
    });

  } catch (error: any) {
    console.error('[Queue Process API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}
