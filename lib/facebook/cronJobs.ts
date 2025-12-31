/**
 * Cron Jobs for Facebook Automation
 * 
 * Scheduled tasks:
 * 1. Every minute: Process pending queue jobs
 * 2. Daily 2 AM: Clean up old events (7+ days)
 * 3. Daily 3 AM: Aggregate page statistics
 * 
 * Usage:
 * ```typescript
 * import { startCronJobs, stopCronJobs } from '@/lib/facebook/cronJobs';
 * 
 * // In server startup
 * startCronJobs();
 * 
 * // On shutdown
 * stopCronJobs();
 * ```
 */

import * as cron from 'node-cron';
import { getPendingJobs, markJobProcessing, markJobCompleted, markJobFailed } from './queueService';
import { processReplyJob, processMessageJob } from './automationEngine';
import { cleanupOldEvents } from './dedupe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Track scheduled tasks
const scheduledTasks: cron.ScheduledTask[] = [];

/**
 * Process pending jobs from queue
 * Runs every minute
 */
async function processQueueJobs() {
  try {
    console.log('[Cron] Checking for pending jobs...');
    
    const jobs = await getPendingJobs(10); // Process up to 10 jobs per minute
    
    if (jobs.length === 0) {
      console.log('[Cron] No pending jobs');
      return;
    }

    console.log(`[Cron] Processing ${jobs.length} jobs`);

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
          console.warn(`[Cron] Unknown job type: ${job.jobType}`);
          continue;
        }

        if (result.success) {
          await markJobCompleted(job.id);
          console.log(`✅ [Cron] Job ${job.id} completed successfully`);
        } else {
          await markJobFailed(job.id, result.reason || result.error || 'Unknown error', job.attempts, job.maxAttempts);
          console.warn(`⚠️ [Cron] Job ${job.id} failed: ${result.reason || result.error}`);
        }

      } catch (error: any) {
        await markJobFailed(job.id, error.message, job.attempts, job.maxAttempts);
        console.error(`❌ [Cron] Error processing job ${job.id}:`, error.message);
      }
    }

  } catch (error: any) {
    console.error('[Cron] Queue processing error:', error.message);
  }
}

/**
 * Clean up old events from database
 * Runs daily at 2 AM
 */
async function cleanupOldEventsTask() {
  try {
    console.log('[Cron] Cleaning up old events...');
    
    const deletedCount = await cleanupOldEvents();
    
    console.log(`✅ [Cron] Deleted ${deletedCount} old events`);

  } catch (error: any) {
    console.error('[Cron] Event cleanup error:', error.message);
  }
}

/**
 * Aggregate page statistics
 * Runs daily at 3 AM
 */
async function aggregatePageStats() {
  try {
    console.log('[Cron] Aggregating page stats...');

    // Get all active pages
    const { data: pages, error: pagesError } = await supabase
      .from('facebook_pages')
      .select('page_id, page_name')
      .eq('automation_enabled', true);

    if (pagesError) throw pagesError;

    if (!pages || pages.length === 0) {
      console.log('[Cron] No active pages to aggregate');
      return;
    }

    for (const page of pages) {
      try {
        // Get today's stats
        const today = new Date().toISOString().split('T')[0];

        const { data: todayStats, error: statsError } = await supabase
          .from('page_stats')
          .select('*')
          .eq('page_id', page.page_id)
          .eq('date', today)
          .single();

        if (statsError && statsError.code !== 'PGRST116') {
          throw statsError;
        }

        if (todayStats) {
          console.log(`✅ [Cron] Stats for ${page.page_name}: ${todayStats.replies_sent} replies, ${todayStats.messages_sent} messages`);
        } else {
          console.log(`[Cron] No stats for ${page.page_name} today`);
        }

        // Calculate weekly average (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weekStart = sevenDaysAgo.toISOString().split('T')[0];

        const { data: weeklyStats, error: weeklyError } = await supabase
          .from('page_stats')
          .select('replies_sent, messages_sent')
          .eq('page_id', page.page_id)
          .gte('date', weekStart);

        if (weeklyError) throw weeklyError;

        if (weeklyStats && weeklyStats.length > 0) {
          const avgReplies = Math.round(
            weeklyStats.reduce((sum, s) => sum + s.replies_sent, 0) / weeklyStats.length
          );
          const avgMessages = Math.round(
            weeklyStats.reduce((sum, s) => sum + s.messages_sent, 0) / weeklyStats.length
          );

          console.log(`📊 [Cron] ${page.page_name} weekly avg: ${avgReplies} replies, ${avgMessages} messages`);
        }

      } catch (error: any) {
        console.error(`[Cron] Error aggregating stats for page ${page.page_id}:`, error.message);
      }
    }

  } catch (error: any) {
    console.error('[Cron] Stats aggregation error:', error.message);
  }
}

/**
 * Start all cron jobs
 */
export function startCronJobs() {
  console.log('🚀 Starting Facebook automation cron jobs...');

  // Every minute: Process queue
  const queueTask = cron.schedule('* * * * *', async () => {
    await processQueueJobs();
  });
  scheduledTasks.push(queueTask);
  console.log('✅ Queue processor: Every minute');

  // Daily 2 AM: Clean up events
  const cleanupTask = cron.schedule('0 2 * * *', async () => {
    await cleanupOldEventsTask();
  });
  scheduledTasks.push(cleanupTask);
  console.log('✅ Event cleanup: Daily at 2 AM');

  // Daily 3 AM: Aggregate stats
  const statsTask = cron.schedule('0 3 * * *', async () => {
    await aggregatePageStats();
  });
  scheduledTasks.push(statsTask);
  console.log('✅ Stats aggregation: Daily at 3 AM');

  console.log('🎉 All cron jobs started successfully!');
}

/**
 * Stop all cron jobs
 */
export function stopCronJobs() {
  console.log('🛑 Stopping Facebook automation cron jobs...');

  for (const task of scheduledTasks) {
    task.stop();
  }

  scheduledTasks.length = 0;
  console.log('✅ All cron jobs stopped');
}

/**
 * Get cron job status
 */
export function getCronJobStatus() {
  return {
    running: scheduledTasks.length > 0,
    taskCount: scheduledTasks.length,
    tasks: [
      { name: 'Queue Processor', schedule: 'Every minute' },
      { name: 'Event Cleanup', schedule: 'Daily at 2 AM' },
      { name: 'Stats Aggregation', schedule: 'Daily at 3 AM' }
    ]
  };
}

// Export individual functions for manual execution
export { processQueueJobs, cleanupOldEventsTask, aggregatePageStats };
