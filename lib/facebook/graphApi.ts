/**
 * Facebook Graph API Wrapper
 * Handles all Graph API calls with error handling
 */

interface GraphAPIError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

interface GraphAPIResponse<T = any> {
  data?: T;
  error?: GraphAPIError;
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

const GRAPH_API_VERSION = 'v24.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Make Graph API request
 */
async function graphRequest<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'DELETE';
    page_access_token: string;
    params?: Record<string, any>;
    body?: Record<string, any>;
  }
): Promise<T> {
  const { method = 'GET', page_access_token, params = {}, body } = options;

  // Build URL
  const url = new URL(`${GRAPH_API_BASE}${endpoint}`);
  url.searchParams.set('access_token', page_access_token);
  
  // Add query params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  // Make request
  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data: GraphAPIResponse<T> = await response.json();

  if (data.error) {
    throw new Error(`Graph API Error: ${data.error.message} (code: ${data.error.code})`);
  }

  return data as T;
}

/**
 * Get user's pages (/me/accounts)
 */
export async function getUserPages(userAccessToken: string) {
  return graphRequest<{
    data: Array<{
      id: string;
      name: string;
      access_token: string;
      category?: string;
      tasks?: string[];
      followers_count?: number;
    }>;
  }>('/me/accounts', {
    page_access_token: userAccessToken,
    params: {
      fields: 'id,name,access_token,category,tasks,followers_count',
    },
  });
}

/**
 * Get page feed posts
 */
export async function getPagePosts(
  page_id: string,
  pageAccessToken: string,
  options?: {
    limit?: number;
    since?: string;
    until?: string;
  }
) {
  return graphRequest<{
    data: Array<{
      id: string;
      message?: string;
      story?: string;
      created_time: string;
      updated_time: string;
      permalink_url?: string;
    }>;
  }>(`/${page_id}/feed`, {
    page_access_token: pageAccessToken,
    params: {
      fields: 'id,message,story,created_time,updated_time,permalink_url',
      limit: options?.limit || 25,
      since: options?.since,
      until: options?.until,
    },
  });
}

/**
 * Get post comments
 */
export async function getPostComments(
  postId: string,
  pageAccessToken: string,
  options?: {
    limit?: number;
  }
) {
  return graphRequest<{
    data: Array<{
      id: string;
      message: string;
      from: {
        id: string;
        name: string;
      };
      created_time: string;
      parent?: { id: string };
      can_reply_privately?: boolean;
    }>;
    summary?: {
      total_count: number;
    };
  }>(`/${postId}/comments`, {
    page_access_token: pageAccessToken,
    params: {
      fields: 'id,message,from,created_time,parent,can_reply_privately',
      summary: true,
      limit: options?.limit || 100,
    },
  });
}

/**
 * Reply to comment
 */
export async function replyToComment(
  commentId: string,
  message: string,
  pageAccessToken: string
) {
  return graphRequest<{
    id: string;
  }>(`/${commentId}/comments`, {
    method: 'POST',
    page_access_token: pageAccessToken,
    body: {
      message,
    },
  });
}

/**
 * Send private reply to comment author
 */
export async function sendPrivateReply(
  commentId: string,
  message: string,
  pageAccessToken: string
) {
  return graphRequest<{
    id: string;
  }>(`/${commentId}/private_replies`, {
    method: 'POST',
    page_access_token: pageAccessToken,
    body: {
      message,
    },
  });
}

/**
 * Send message via Pages Messaging API
 */
export async function sendPageMessage(
  page_id: string,
  recipientId: string,
  message: string,
  pageAccessToken: string
) {
  return graphRequest<{
    recipient_id: string;
    message_id: string;
  }>(`/${page_id}/messages`, {
    method: 'POST',
    page_access_token: pageAccessToken,
    body: {
      recipient: {
        id: recipientId,
      },
      message: {
        text: message,
      },
    },
  });
}

/**
 * Get comment details
 * Note: post_id field doesn't exist on Comment nodes in Graph API v24.0
 */
export async function getComment(
  commentId: string,
  pageAccessToken: string
) {
  return graphRequest<{
    id: string;
    message: string;
    from: {
      id: string;
      name: string;
    };
    created_time: string;
    parent?: { id: string };
  }>(`/${commentId}`, {
    page_access_token: pageAccessToken,
    params: {
      fields: 'id,message,from,created_time,parent',
    },
  });
}

/**
 * Get post details with counts
 */
export async function getPost(
  postId: string,
  pageAccessToken: string
) {
  return graphRequest<{
    id: string;
    message?: string;
    story?: string;
    created_time: string;
    comments?: {
      summary: {
        total_count: number;
      };
    };
    reactions?: {
      summary: {
        total_count: number;
      };
    };
  }>(`/${postId}`, {
    page_access_token: pageAccessToken,
    params: {
      fields: 'id,message,story,created_time,comments.summary(true),reactions.summary(true)',
    },
  });
}

/**
 * Debug token to check permissions
 */
export async function debugToken(
  page_access_token: string,
  appToken: string
) {
  return graphRequest<{
    data: {
      app_id: string;
      type: string;
      application: string;
      data_access_expires_at: number;
      expires_at: number;
      is_valid: boolean;
      scopes: string[];
      user_id?: string;
    };
  }>('/debug_token', {
    page_access_token: appToken,
    params: {
      input_token: page_access_token,
    },
  });
}

/**
 * Exchange short-lived token for long-lived token
 */
export async function extendAccessToken(
  shortLivedToken: string,
  appId: string,
  appSecret: string
) {
  return graphRequest<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }>('/oauth/access_token', {
    page_access_token: '', // No token needed for this endpoint
    params: {
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortLivedToken,
    },
  });
}

/**
 * Subscribe a Page to receive webhook events
 * This is REQUIRED for webhooks to work on specific pages
 */
export async function subscribePageWebhooks(
  pageId: string,
  pageAccessToken: string,
  subscribedFields: string[] = ['feed', 'messages']
) {
  return graphRequest<{ success: boolean }>(`/${pageId}/subscribed_apps`, {
    method: 'POST',
    page_access_token: pageAccessToken,
    body: {
      subscribed_fields: subscribedFields,
    },
  });
}

/**
 * Get current webhook subscriptions for a Page
 */
export async function getPageSubscriptions(
  pageId: string,
  pageAccessToken: string
) {
  return graphRequest<{
    data: Array<{
      id: string;
      name: string;
      subscribed_fields: string[];
    }>;
  }>(`/${pageId}/subscribed_apps`, {
    method: 'GET',
    page_access_token: pageAccessToken,
  });
}

/**
 * Unsubscribe a Page from webhook events
 */
export async function unsubscribePageWebhooks(
  pageId: string,
  pageAccessToken: string
) {
  return graphRequest<{ success: boolean }>(`/${pageId}/subscribed_apps`, {
    method: 'DELETE',
    page_access_token: pageAccessToken,
  });
}
