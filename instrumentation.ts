/**
 * Next.js Instrumentation Hook
 * This runs once when the server starts (both dev and production)
 */

export async function register() {
  // Only run on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Server starting - initializing Facebook automation...');
    
    // Dynamically import to avoid edge runtime issues
    const { startCronJobs } = await import('@/lib/facebook/cronJobs');
    
    // Start cron jobs for Facebook automation
    startCronJobs();
    
    console.log('✅ Facebook automation cron jobs started');
  }
}
