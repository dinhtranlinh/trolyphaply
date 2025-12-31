/**
 * Stats Service
 * 
 * Provides statistics and analytics for Facebook automation.
 * Aggregates data from automation_logs and page_stats tables.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface DailyStats {
  date: string;
  replies: number;
  messages: number;
  failed: number;
  total: number;
  successRate: number;
}

export interface ActionTypeStats {
  action_type: string;
  total: number;
  success: number;
  failed: number;
  successRate: number;
}

export interface PageStats {
  page_id: string;
  page_name?: string;
  replies: number;
  messages: number;
  failed: number;
  total: number;
}

/**
 * Get today's statistics
 */
export async function getTodayStats(page_id?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return getDateRangeStats(today.toISOString(), new Date().toISOString(), page_id);
}

/**
 * Get statistics for a date range
 */
export async function getDateRangeStats(
  startDate: string,
  endDate: string,
  page_id?: string
): Promise<DailyStats> {
  let query = supabase
    .from('automation_logs')
    .select('action_type, status')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (page_id) {
    query = query.eq('page_id', page_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Failed to get date range stats:', error);
    throw new Error(`Failed to get date range stats: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return {
      date: new Date(startDate).toISOString().split('T')[0],
      replies: 0,
      messages: 0,
      failed: 0,
      total: 0,
      successRate: 0,
    };
  }

  const replies = data.filter(
    (log) => log.action_type === 'reply_sent' && log.status === 'success'
  ).length;

  const messages = data.filter(
    (log) => log.action_type === 'message_sent' && log.status === 'success'
  ).length;

  const failed = data.filter((log) => log.status === 'failed').length;
  const total = data.length;
  const successRate = total > 0 ? ((total - failed) / total) * 100 : 0;

  return {
    date: new Date(startDate).toISOString().split('T')[0],
    replies,
    messages,
    failed,
    total,
    successRate: parseFloat(successRate.toFixed(2)),
  };
}

/**
 * Get daily statistics for the last N days
 */
export async function getDailyStats(days: number = 7, page_id?: string): Promise<DailyStats[]> {
  const stats: DailyStats[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const startDate = date.toISOString();
    const endDate = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const dayStats = await getDateRangeStats(startDate, endDate, page_id);
    stats.push(dayStats);
  }

  return stats;
}

/**
 * Get statistics grouped by action type
 */
export async function getActionTypeStats(
  startDate?: string,
  endDate?: string,
  page_id?: string
): Promise<ActionTypeStats[]> {
  let query = supabase.from('automation_logs').select('action_type, status');

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  if (page_id) {
    query = query.eq('page_id', page_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Failed to get action type stats:', error);
    throw new Error(`Failed to get action type stats: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Group by action type
  const grouped = data.reduce((acc: any, log) => {
    const key = log.action_type;
    if (!acc[key]) {
      acc[key] = { total: 0, success: 0, failed: 0 };
    }
    acc[key].total++;
    if (log.status === 'success') {
      acc[key].success++;
    } else if (log.status === 'failed') {
      acc[key].failed++;
    }
    return acc;
  }, {});

  // Convert to array
  const stats: ActionTypeStats[] = Object.entries(grouped).map(([action_type, counts]: [string, any]) => ({
    action_type,
    total: counts.total,
    success: counts.success,
    failed: counts.failed,
    successRate: counts.total > 0 ? (counts.success / counts.total) * 100 : 0,
  }));

  return stats;
}

/**
 * Get statistics grouped by page
 */
export async function getPageStats(
  startDate?: string,
  endDate?: string
): Promise<PageStats[]> {
  let query = supabase
    .from('automation_logs')
    .select('page_id, action_type, status');

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Failed to get page stats:', error);
    throw new Error(`Failed to get page stats: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Group by page
  const grouped = data.reduce((acc: any, log) => {
    const key = log.page_id;
    if (!acc[key]) {
      acc[key] = { replies: 0, messages: 0, failed: 0, total: 0 };
    }
    acc[key].total++;

    if (log.status === 'success') {
      if (log.action_type === 'reply_sent') {
        acc[key].replies++;
      } else if (log.action_type === 'message_sent') {
        acc[key].messages++;
      }
    } else if (log.status === 'failed') {
      acc[key].failed++;
    }
    return acc;
  }, {});

  // Convert to array
  const stats: PageStats[] = Object.entries(grouped).map(([page_id, counts]: any) => ({
    page_id,
    replies: counts.replies,
    messages: counts.messages,
    failed: counts.failed,
    total: counts.total,
  }));

  // Get page names
  const pageIds = stats.map((s) => s.page_id);
  const { data: pages } = await supabase
    .from('facebook_pages')
    .select('id, page_name')
    .in('id', pageIds);

  if (pages) {
    stats.forEach((stat) => {
      const page = pages.find((p) => p.id === stat.page_id);
      if (page) {
        stat.page_name = page.page_name;
      }
    });
  }

  return stats;
}

/**
 * Get overall success rate
 */
export async function getSuccessRate(
  startDate?: string,
  endDate?: string,
  pageId?: string
): Promise<{ successRate: number; total: number; success: number; failed: number }> {
  let query = supabase.from('automation_logs').select('status');

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  if (pageId) {
    query = query.eq('page_id', pageId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Failed to get success rate:', error);
    throw new Error(`Failed to get success rate: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return { successRate: 0, total: 0, success: 0, failed: 0 };
  }

  const total = data.length;
  const success = data.filter((log) => log.status === 'success').length;
  const failed = data.filter((log) => log.status === 'failed').length;
  const successRate = total > 0 ? (success / total) * 100 : 0;

  return {
    successRate: parseFloat(successRate.toFixed(2)),
    total,
    success,
    failed,
  };
}

/**
 * Get hourly distribution (for heatmap)
 */
export async function getHourlyDistribution(
  startDate?: string,
  endDate?: string,
  pageId?: string
): Promise<{ hour: number; count: number }[]> {
  let query = supabase.from('automation_logs').select('created_at');

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  if (pageId) {
    query = query.eq('page_id', pageId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ Failed to get hourly distribution:', error);
    throw new Error(`Failed to get hourly distribution: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
  }

  // Group by hour
  const grouped = data.reduce((acc: any, log) => {
    const hour = new Date(log.created_at).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  // Convert to array
  const distribution = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: grouped[i] || 0,
  }));

  return distribution;
}

/**
 * Get summary statistics
 */
export async function getSummaryStats(pageId?: string) {
  const today = await getTodayStats(pageId);
  const last7Days = await getDailyStats(7, pageId);
  const actionTypes = await getActionTypeStats(undefined, undefined, pageId);
  const successRate = await getSuccessRate(undefined, undefined, pageId);

  return {
    today,
    last7Days,
    actionTypes,
    successRate,
  };
}
