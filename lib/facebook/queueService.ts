/**
 * Queue Service
 * Manage automation jobs with delayed execution
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface QueueJob {
  id: string;
  jobType: 'reply_comment' | 'send_message';
  page_id: string;
  target_id: string;
  payload: any;
  scheduledAt: Date;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error: string | null;
  completedAt: Date | null;
  created_at: Date;
}

/**
 * Enqueue a job with random delay (1-5 minutes)
 */
export async function enqueueJob(params: {
  jobType: 'reply_comment' | 'send_message';
  page_id: string;
  target_id: string;
  payload: any;
  delaySeconds?: number; // Optional override
}): Promise<string | null> {
  try {
    // Random delay between 60-300 seconds (1-5 minutes)
    const delaySeconds = params.delaySeconds ?? (60 + Math.floor(Math.random() * 240));
    const scheduledAt = new Date(Date.now() + delaySeconds * 1000);
    
    const { data, error } = await supabase
      .from('automation_queue')
      .insert({
        job_type: params.jobType,
        page_id: params.page_id,
        target_id: params.target_id,
        payload: params.payload,
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('[Queue] Error enqueueing:', error);
      return null;
    }
    
    console.log(`[Queue] ✅ Job enqueued: ${params.jobType} for ${params.target_id} (delay: ${delaySeconds}s)`);
    return data.id;
  } catch (error) {
    console.error('[Queue] Exception enqueueing:', error);
    return null;
  }
}

/**
 * Get pending jobs ready to process
 */
export async function getPendingJobs(limit: number = 10): Promise<QueueJob[]> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('automation_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('[Queue] Error getting pending jobs:', error);
      return [];
    }
    
    return (data || []).map(job => ({
      id: job.id,
      jobType: job.job_type,
      page_id: job.page_id,
      target_id: job.target_id,
      payload: job.payload,
      scheduledAt: new Date(job.scheduled_at),
      attempts: job.attempts,
      maxAttempts: job.max_attempts,
      status: job.status,
      error: job.error,
      completedAt: job.completed_at ? new Date(job.completed_at) : null,
      created_at: new Date(job.created_at),
    }));
  } catch (error) {
    console.error('[Queue] Exception getting jobs:', error);
    return [];
  }
}

/**
 * Mark job as processing
 */
export async function markJobProcessing(jobId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('automation_queue')
      .update({
        status: 'processing',
      })
      .eq('id', jobId)
      .eq('status', 'pending'); // Only update if still pending
    
    if (error) {
      console.error('[Queue] Error marking processing:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[Queue] Exception marking processing:', error);
    return false;
  }
}

/**
 * Mark job as completed
 */
export async function markJobCompleted(jobId: string): Promise<void> {
  try {
    await supabase
      .from('automation_queue')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  } catch (error) {
    console.error('[Queue] Error marking completed:', error);
  }
}

/**
 * Mark job as failed (with retry logic)
 */
export async function markJobFailed(
  jobId: string,
  errorMessage: string,
  currentAttempts: number,
  maxAttempts: number
): Promise<void> {
  try {
    const shouldRetry = currentAttempts < maxAttempts;
    
    if (shouldRetry) {
      // Increment attempts and reset to pending for retry
      await supabase
        .from('automation_queue')
        .update({
          status: 'pending',
          attempts: currentAttempts + 1,
          error: errorMessage,
          // Add exponential backoff: 2min, 4min, 8min
          scheduled_at: new Date(Date.now() + Math.pow(2, currentAttempts) * 120 * 1000).toISOString(),
        })
        .eq('id', jobId);
      
      console.log(`[Queue] ⚠️ Job failed, will retry (attempt ${currentAttempts + 1}/${maxAttempts})`);
    } else {
      // Max attempts reached, mark as failed permanently
      await supabase
        .from('automation_queue')
        .update({
          status: 'failed',
          attempts: currentAttempts + 1,
          error: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
      
      console.error(`[Queue] ❌ Job failed permanently: ${errorMessage}`);
    }
  } catch (error) {
    console.error('[Queue] Error marking failed:', error);
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}> {
  try {
    const { data, error } = await supabase
      .from('automation_queue')
      .select('status');
    
    if (error || !data) {
      return { pending: 0, processing: 0, completed: 0, failed: 0, total: 0 };
    }
    
    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: data.length,
    };
    
    data.forEach(job => {
      if (job.status in stats) {
        stats[job.status as keyof typeof stats]++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('[Queue] Error getting stats:', error);
    return { pending: 0, processing: 0, completed: 0, failed: 0, total: 0 };
  }
}

/**
 * Clean up old completed/failed jobs (older than 7 days)
 */
export async function cleanupOldJobs(): Promise<number> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('automation_queue')
      .delete()
      .in('status', ['completed', 'failed'])
      .lt('completed_at', sevenDaysAgo.toISOString())
      .select('id');
    
    if (error) {
      throw error;
    }
    
    const count = data?.length || 0;
    console.log(`[Queue] 🧹 Cleaned up ${count} old jobs`);
    return count;
  } catch (error) {
    console.error('[Queue] Error cleaning up:', error);
    return 0;
  }
}
