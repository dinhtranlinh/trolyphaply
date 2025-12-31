/**
 * Pages Service
 * Manage Facebook pages - sync from Graph API, save to DB
 */

import { createClient } from '@supabase/supabase-js';
import { getUserPages } from './graphApi';
import { encryptToken, decryptToken } from './tokenManager';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface FacebookPage {
  id: string;
  page_id: string;
  page_name: string;
  page_access_token?: string;
  category: string;
  follower_count?: number;
  automation_enabled: boolean;
  status: string;
  last_sync_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Sync pages from Facebook /me/accounts
 */
export async function syncPagesFromFacebook(userAccessToken: string, connectionId: string): Promise<{
  success: boolean;
  pages?: any[];
  synced?: number;
  error?: string;
}> {
  try {
    // Fetch pages from Facebook
    const pagesResponse = await getUserPages(userAccessToken);
    const pagesData = pagesResponse.data || [];
    
    if (pagesData.length === 0) {
      return {
        success: true,
        pages: [],
        synced: 0
      };
    }
    
    console.log(`[PagesService] Fetched ${pagesData.length} pages from Facebook`);
    
    // Save each page to database
    let syncedCount = 0;
    
    for (const page of pagesData) {
      try {
        // Encrypt page access token
        const encryptedToken = encryptToken(page.access_token);
        
        // Upsert page (update if exists, insert if new)
        const { error } = await supabase
          .from('facebook_pages')
          .upsert({
            page_id: page.id,
            page_name: page.name,
            category: page.category || 'Unknown',
            page_access_token: encryptedToken,
            automation_enabled: false,
            status: 'active',
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'page_id'
          });
        
        if (error) {
          console.error(`[PagesService] Error saving page ${page.id}:`, error);
        } else {
          syncedCount++;
        }
      } catch (error: any) {
        console.error(`[PagesService] Error processing page ${page.id}:`, error);
      }
    }
    
    console.log(`[PagesService] ✅ Synced ${syncedCount}/${pagesData.length} pages`);
    
    // Return full page data from API response
    return {
      success: true,
      pages: pagesResponse.data.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        access_token: p.access_token
      })),
      synced: syncedCount
    };
  } catch (error: any) {
    console.error('[PagesService] Sync error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all pages from database
 */
export async function getAllPages(): Promise<FacebookPage[]> {
  try {
    const { data, error } = await supabase
      .from('facebook_pages')
      .select('*')
      .order('page_name', { ascending: true });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Decrypt access tokens
    return data.map(page => ({
      id: page.id,
      page_id: page.page_id,
      page_name: page.page_name,
      category: page.category,
      page_access_token: decryptToken(page.page_access_token),
      follower_count: page.follower_count,
      automation_enabled: page.automation_enabled,
      status: page.status,
      last_sync_at: page.last_sync_at ? new Date(page.last_sync_at) : null,
      created_at: new Date(page.created_at),
      updated_at: new Date(page.updated_at)
    }));
  } catch (error: any) {
    console.error('[PagesService] Error getting pages:', error);
    return [];
  }
}

/**
 * Get single page by ID
 */
export async function getPageById(page_id: string): Promise<FacebookPage | null> {
  try {
    const { data, error } = await supabase
      .from('facebook_pages')
      .select('*')
      .eq('page_id', page_id)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      id: data.id,
      page_id: data.page_id,
      page_name: data.page_name,
      category: data.category,
      page_access_token: decryptToken(data.page_access_token),
      follower_count: data.follower_count,
      automation_enabled: data.automation_enabled,
      status: data.status,
      last_sync_at: data.last_sync_at ? new Date(data.last_sync_at) : null,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  } catch (error: any) {
    console.error('[PagesService] Error getting page:', error);
    return null;
  }
}

/**
 * Get single page by database ID
 */
export async function getPageByDbId(id: string): Promise<FacebookPage | null> {
  try {
    const { data, error } = await supabase
      .from('facebook_pages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      id: data.id,
      page_id: data.page_id,
      page_name: data.page_name,
      category: data.category,
      page_access_token: decryptToken(data.page_access_token),
      follower_count: data.follower_count,
      automation_enabled: data.automation_enabled,
      status: data.status,
      last_sync_at: data.last_sync_at ? new Date(data.last_sync_at) : null,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  } catch (error: any) {
    console.error('[PagesService] Error getting page by DB ID:', error);
    return null;
  }
}

/**
 * Update page settings (enable/disable automation)
 */
export async function updatePage(id: string, updates: {
  automation_enabled?: boolean;
  page_name?: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.automation_enabled !== undefined) {
      updateData.automation_enabled = updates.automation_enabled;
    }
    
    if (updates.page_name) {
      updateData.page_name = updates.page_name;
    }
    
    const { error } = await supabase
      .from('facebook_pages')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    
    console.log(`[PagesService] ✅ Page ${id} updated successfully`);
    
    return { success: true };
  } catch (error: any) {
    console.error('[PagesService] Error updating page:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete page from database
 */
export async function deletePage(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Delete page (cascade will delete rules, stats)
    const { error } = await supabase
      .from('facebook_pages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    console.log(`[PagesService] ✅ Page ${id} deleted successfully`);
    
    return { success: true };
  } catch (error: any) {
    console.error('[PagesService] Error deleting page:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get pages stats summary
 */
export async function getPagesStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
}> {
  try {
    const { data, error } = await supabase
      .from('facebook_pages')
      .select('automation_enabled');
    
    if (error) throw error;
    
    const total = data?.length || 0;
    const active = data?.filter(p => p.automation_enabled).length || 0;
    
    return {
      total,
      active,
      inactive: total - active
    };
  } catch (error: any) {
    console.error('[PagesService] Error getting stats:', error);
    return {
      total: 0,
      active: 0,
      inactive: 0
    };
  }
}

/**
 * Bulk enable/disable pages
 */
export async function bulkUpdatePages(pageIds: string[], enabled: boolean): Promise<{
  success: boolean;
  updated: number;
  error?: string;
}> {
  try {
    const { error, count } = await supabase
      .from('facebook_pages')
      .update({
        automation_enabled: enabled,
        updated_at: new Date().toISOString()
      })
      .in('id', pageIds);
    
    if (error) throw error;
    
    console.log(`[PagesService] ✅ Bulk updated ${count || 0} pages`);
    
    return {
      success: true,
      updated: count || 0
    };
  } catch (error: any) {
    console.error('[PagesService] Error bulk updating:', error);
    return {
      success: false,
      updated: 0,
      error: error.message
    };
  }
}
