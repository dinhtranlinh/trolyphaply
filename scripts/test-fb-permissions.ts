/**
 * Test Facebook Graph API Permissions
 * =====================================
 * 
 * Script này:
 * 1. Lấy token từ database (decrypt nếu cần)
 * 2. Test tất cả API permissions
 * 3. Output kết quả chi tiết
 * 
 * Usage:
 *   npx ts-node scripts/test-fb-permissions.ts
 *   
 * Hoặc (nếu dùng token thủ công):
 *   FB_TOKEN=your_token FB_PAGE_ID=123456 npx ts-node scripts/test-fb-permissions.ts
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import 'dotenv/config';

const GRAPH_API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// Encryption settings (same as tokenManager.ts)
const ENCRYPTION_KEY = process.env.FACEBOOK_TOKEN_ENCRYPTION_KEY || 'default-key-change-in-production-32bytes';
const ALGORITHM = 'aes-256-cbc';

interface TestResult {
  permission: string;
  endpoint: string;
  success: boolean;
  details: string;
}

const results: TestResult[] = [];

// ============================================
// HELPER FUNCTIONS
// ============================================

function decryptToken(encryptedData: string): string {
  try {
    const [ivHex, encrypted] = encryptedData.split(':');
    if (!encrypted) {
      // Not encrypted, return as-is
      return encryptedData;
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch {
    // If decryption fails, assume it's not encrypted
    return encryptedData;
  }
}

async function makeRequest(
  token: string,
  method: 'GET' | 'POST' | 'DELETE',
  endpoint: string,
  params: Record<string, any> = {},
  body?: Record<string, any>
): Promise<{ data: any; error: string | null }> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set('access_token', token);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  
  try {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url.toString(), options);
    const data = await response.json();
    
    if (data.error) {
      return { data: null, error: `${data.error.message} (code: ${data.error.code})` };
    }
    
    return { data, error: null };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

function logResult(permission: string, endpoint: string, success: boolean, details: string) {
  results.push({ permission, endpoint, success, details });
  
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} | ${permission} | ${endpoint}`);
  if (details) {
    console.log(`       └── ${details.slice(0, 100)}`);
  }
}

// ============================================
// TEST FUNCTIONS FOR EACH PERMISSION
// ============================================

async function testPagesReadUserContent(token: string, pageId: string) {
  console.log('\n' + '='.repeat(60));
  console.log('Testing: pages_read_user_content');
  console.log('='.repeat(60));
  
  // Get feed (includes visitor posts)
  const { data, error } = await makeRequest(token, 'GET', `${pageId}/feed`, {
    fields: 'id,message,from,created_time,type',
    limit: 5
  });
  
  if (error) {
    logResult('pages_read_user_content', `${pageId}/feed`, false, error);
  } else if (data?.data) {
    logResult('pages_read_user_content', `${pageId}/feed`, true, `Found ${data.data.length} posts`);
  } else {
    logResult('pages_read_user_content', `${pageId}/feed`, false, 'No data returned');
  }
}

async function testPagesReadEngagement(token: string, pageId: string) {
  console.log('\n' + '='.repeat(60));
  console.log('Testing: pages_read_engagement');
  console.log('='.repeat(60));
  
  // Get page insights
  const { data, error } = await makeRequest(token, 'GET', `${pageId}/insights`, {
    metric: 'page_engaged_users,page_post_engagements',
    period: 'day'
  });
  
  if (error) {
    logResult('pages_read_engagement', `${pageId}/insights`, false, error);
  } else if (data?.data) {
    logResult('pages_read_engagement', `${pageId}/insights`, true, `Got ${data.data.length} metrics`);
  } else {
    logResult('pages_read_engagement', `${pageId}/insights`, false, 'No data returned');
  }
  
  // Get posts with engagement
  const { data: postsData, error: postsError } = await makeRequest(token, 'GET', `${pageId}/posts`, {
    fields: 'id,message,likes.summary(true),comments.summary(true),shares',
    limit: 5
  });
  
  if (postsError) {
    logResult('pages_read_engagement', `${pageId}/posts (engagement)`, false, postsError);
  } else if (postsData?.data) {
    logResult('pages_read_engagement', `${pageId}/posts (engagement)`, true, 
      `Got engagement for ${postsData.data.length} posts`);
  }
}

async function testPagesManagePosts(token: string, pageId: string) {
  console.log('\n' + '='.repeat(60));
  console.log('Testing: pages_manage_posts');
  console.log('='.repeat(60));
  
  // Create unpublished test post
  const { data, error } = await makeRequest(token, 'POST', `${pageId}/feed`, {}, {
    message: `[API Test] Created at ${new Date().toISOString()}. Will be deleted.`,
    published: false
  });
  
  if (error) {
    logResult('pages_manage_posts', `${pageId}/feed (CREATE)`, false, error);
    return;
  }
  
  if (data?.id) {
    const postId = data.id;
    logResult('pages_manage_posts', `${pageId}/feed (CREATE)`, true, `Created: ${postId}`);
    
    // Delete the test post
    const { data: delData, error: delError } = await makeRequest(token, 'DELETE', postId);
    
    if (delError) {
      logResult('pages_manage_posts', `${postId} (DELETE)`, false, delError);
    } else if (delData?.success) {
      logResult('pages_manage_posts', `${postId} (DELETE)`, true, 'Deleted successfully');
    }
  } else {
    logResult('pages_manage_posts', `${pageId}/feed (CREATE)`, false, 'No post ID returned');
  }
}

async function testPagesManageEngagement(token: string, pageId: string) {
  console.log('\n' + '='.repeat(60));
  console.log('Testing: pages_manage_engagement');
  console.log('='.repeat(60));
  
  // Get a recent post
  const { data: postsData } = await makeRequest(token, 'GET', `${pageId}/posts`, {
    fields: 'id,message',
    limit: 1
  });
  
  if (!postsData?.data?.[0]) {
    logResult('pages_manage_engagement', 'GET posts', false, 'No posts found');
    return;
  }
  
  const postId = postsData.data[0].id;
  
  // Get comments
  const { data: commentsData, error } = await makeRequest(token, 'GET', `${postId}/comments`, {
    fields: 'id,message,from,created_time',
    limit: 5
  });
  
  if (error) {
    logResult('pages_manage_engagement', `${postId}/comments (READ)`, false, error);
  } else if (commentsData?.data) {
    logResult('pages_manage_engagement', `${postId}/comments (READ)`, true, 
      `Got ${commentsData.data.length} comments`);
    
    // If there are comments, try to reply
    if (commentsData.data.length > 0) {
      const commentId = commentsData.data[0].id;
      
      const { data: replyData, error: replyError } = await makeRequest(
        token, 'POST', `${commentId}/comments`, {}, 
        { message: '[API Test Reply] Thank you!' }
      );
      
      if (replyError) {
        logResult('pages_manage_engagement', `${commentId}/comments (REPLY)`, false, replyError);
      } else if (replyData?.id) {
        logResult('pages_manage_engagement', `${commentId}/comments (REPLY)`, true, 
          `Created reply: ${replyData.id}`);
        
        // Clean up
        await makeRequest(token, 'DELETE', replyData.id);
        console.log('       └── Test reply cleaned up');
      }
    }
  }
}

async function testBusinessManagement(token: string) {
  console.log('\n' + '='.repeat(60));
  console.log('Testing: business_management');
  console.log('='.repeat(60));
  
  const { data, error } = await makeRequest(token, 'GET', 'me/businesses', {
    fields: 'id,name,created_time'
  });
  
  if (error) {
    logResult('business_management', 'me/businesses', false, error);
  } else if (data?.data) {
    logResult('business_management', 'me/businesses', true, `Found ${data.data.length} businesses`);
    
    if (data.data.length > 0) {
      const businessId = data.data[0].id;
      
      const { data: pagesData, error: pagesError } = await makeRequest(
        token, 'GET', `${businessId}/owned_pages`,
        { fields: 'id,name' }
      );
      
      if (pagesError) {
        logResult('business_management', `${businessId}/owned_pages`, false, pagesError);
      } else if (pagesData?.data) {
        logResult('business_management', `${businessId}/owned_pages`, true, 
          `Found ${pagesData.data.length} pages`);
      }
    }
  }
}

async function testAdditionalPermissions(token: string, pageId: string) {
  console.log('\n' + '='.repeat(60));
  console.log('Testing: Additional permissions (verification)');
  console.log('='.repeat(60));
  
  // pages_show_list
  const { data: accountsData, error: accountsError } = await makeRequest(token, 'GET', 'me/accounts', {
    fields: 'id,name,category'
  });
  
  if (accountsError) {
    logResult('pages_show_list', 'me/accounts', false, accountsError);
  } else if (accountsData?.data) {
    logResult('pages_show_list', 'me/accounts', true, `Found ${accountsData.data.length} pages`);
  }
  
  // pages_manage_metadata
  const { data: pageData, error: pageError } = await makeRequest(token, 'GET', pageId, {
    fields: 'id,name,about,category,phone,website'
  });
  
  if (pageError) {
    logResult('pages_manage_metadata', pageId, false, pageError);
  } else if (pageData?.id) {
    logResult('pages_manage_metadata', pageId, true, `Page: ${pageData.name}`);
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\nTotal tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.permission}: ${r.endpoint}`);
      console.log(`    ${r.details.slice(0, 80)}`);
    });
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('FACEBOOK GRAPH API PERMISSION TEST');
  console.log('='.repeat(60));
  
  let token = process.env.FB_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  let pageId = process.env.FB_PAGE_ID || process.env.FACEBOOK_PAGE_ID;
  
  // If not provided via env, get from database
  if (!token || !pageId) {
    console.log('\nNo token in env, fetching from database...');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: pages, error } = await supabase
      .from('facebook_pages')
      .select('*')
      .eq('status', 'active')
      .limit(1);
    
    if (error || !pages?.length) {
      console.error('❌ No active pages found in database');
      console.log('\nUsage:');
      console.log('  FB_TOKEN=<token> FB_PAGE_ID=<page_id> npx ts-node scripts/test-fb-permissions.ts');
      process.exit(1);
    }
    
    const page = pages[0];
    pageId = page.page_id;
    token = decryptToken(page.page_access_token);
    
    console.log(`\nUsing page: ${page.page_name} (${pageId})`);
  }
  
  if (!token || !pageId) {
    console.error('Missing token or page ID after lookup');
    process.exit(1);
  }

  console.log(`\nAPI Version: ${GRAPH_API_VERSION}`);
  console.log(`Page ID: ${pageId}`);
  console.log(`Token: ${token.slice(0, 20)}...`);
  
  // Run all tests
  await testPagesReadUserContent(token, pageId);
  await testPagesReadEngagement(token, pageId);
  await testPagesManagePosts(token, pageId);
  await testPagesManageEngagement(token, pageId);
  await testBusinessManagement(token);
  await testAdditionalPermissions(token, pageId);
  
  printSummary();
}

main().catch(console.error);
