// Analytics helpers
import { supabase } from './supabase';

export type EventType = 'view' | 'submit' | 'share' | 'error' | 'affiliate_click';

export async function logEvent(
  appId: string,
  eventType: EventType,
  metadata?: Record<string, any>,
  resultId?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('app_events').insert({
      app_id: appId,
      event_type: eventType,
      result_id: resultId,
      metadata,
    });

    if (error) {
      console.error('Failed to log event:', error);
    }
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

export async function incrementStats(
  appId: string,
  statType: 'views' | 'submits' | 'shares' | 'affiliate_clicks',
  date: Date = new Date()
): Promise<void> {
  try {
    const dateStr = date.toISOString().split('T')[0];

    // Try to increment existing record
    const { data: existing } = await supabase
      .from('app_stats_daily')
      .select('*')
      .eq('app_id', appId)
      .eq('date', dateStr)
      .single();

    if (existing) {
      // Update existing
      const updates: any = {};
      updates[statType] = existing[statType] + 1;

      await supabase
        .from('app_stats_daily')
        .update(updates)
        .eq('app_id', appId)
        .eq('date', dateStr);
    } else {
      // Insert new
      const initial: any = {
        app_id: appId,
        date: dateStr,
        views: 0,
        submits: 0,
        shares: 0,
        affiliate_clicks: 0,
      };
      initial[statType] = 1;

      await supabase.from('app_stats_daily').insert(initial);
    }
  } catch (error) {
    console.error('Failed to increment stats:', error);
  }
}

export async function getAppStats(
  appId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  views: number;
  submits: number;
  shares: number;
  affiliate_clicks: number;
}> {
  const { data, error } = await supabase
    .from('app_stats_daily')
    .select('*')
    .eq('app_id', appId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0]);

  if (error) {
    throw new Error(`Failed to get stats: ${error.message}`);
  }

  return (data || []).reduce(
    (acc, row) => ({
      views: acc.views + row.views,
      submits: acc.submits + row.submits,
      shares: acc.shares + row.shares,
      affiliate_clicks: acc.affiliate_clicks + row.affiliate_clicks,
    }),
    { views: 0, submits: 0, shares: 0, affiliate_clicks: 0 }
  );
}
