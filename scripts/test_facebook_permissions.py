"""
Facebook Graph API Permission Test Script
==========================================
Script này test tất cả các API permissions cần thiết cho Facebook App Review.

Các permissions cần test:
- pages_read_user_content: Đọc nội dung người dùng đăng trên page
- pages_read_engagement: Đọc engagement (likes, comments, shares)
- pages_manage_posts: Tạo/sửa/xóa bài đăng
- pages_manage_engagement: Quản lý comments, reactions
- business_management: Quản lý business assets

Đã hoàn tất (không cần test):
- pages_manage_metadata: ✅
- public_profile: ✅
- pages_show_list: ✅

Usage:
    python scripts/test_facebook_permissions.py

Yêu cầu:
    pip install requests python-dotenv
"""

import os
import sys
import json
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
GRAPH_API_VERSION = "v21.0"
BASE_URL = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

# Get token from environment or .env file
PAGE_ACCESS_TOKEN = os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN") or os.getenv("FB_PAGE_TOKEN")
PAGE_ID = os.getenv("FACEBOOK_PAGE_ID") or os.getenv("FB_PAGE_ID")

# Test results storage
test_results = []


def log_result(permission: str, endpoint: str, success: bool, details: str = ""):
    """Log test result"""
    result = {
        "permission": permission,
        "endpoint": endpoint,
        "success": success,
        "details": details,
        "timestamp": datetime.now().isoformat()
    }
    test_results.append(result)
    
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} | {permission} | {endpoint}")
    if details:
        print(f"       └── {details[:100]}...")


def make_request(method: str, endpoint: str, params: dict = None, data: dict = None):
    """Make Graph API request"""
    url = f"{BASE_URL}/{endpoint}"
    
    if params is None:
        params = {}
    params["access_token"] = PAGE_ACCESS_TOKEN
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, params=params, timeout=30)
        elif method.upper() == "POST":
            response = requests.post(url, params=params, json=data, timeout=30)
        elif method.upper() == "DELETE":
            response = requests.delete(url, params=params, timeout=30)
        else:
            return None, f"Unsupported method: {method}"
        
        return response.json(), None
    except Exception as e:
        return None, str(e)


# ============================================
# TEST FUNCTIONS FOR EACH PERMISSION
# ============================================

def test_pages_read_user_content():
    """
    Permission: pages_read_user_content
    Mục đích: Đọc nội dung người dùng đăng trên page (visitor posts, reviews)
    """
    print("\n" + "="*60)
    print("Testing: pages_read_user_content")
    print("="*60)
    
    # Test 1: Get visitor posts (posts made by others on your page)
    data, error = make_request("GET", f"{PAGE_ID}/feed", {
        "fields": "id,message,from,created_time,type",
        "limit": 5
    })
    
    if error:
        log_result("pages_read_user_content", f"{PAGE_ID}/feed", False, f"Error: {error}")
    elif "data" in data:
        log_result("pages_read_user_content", f"{PAGE_ID}/feed", True, 
                   f"Found {len(data['data'])} posts")
    else:
        log_result("pages_read_user_content", f"{PAGE_ID}/feed", False, 
                   f"Unexpected response: {json.dumps(data)[:100]}")
    
    # Test 2: Get page reviews/ratings
    data, error = make_request("GET", f"{PAGE_ID}/ratings", {
        "fields": "reviewer,rating,review_text,created_time",
        "limit": 5
    })
    
    if error:
        log_result("pages_read_user_content", f"{PAGE_ID}/ratings", False, f"Error: {error}")
    elif "data" in data:
        log_result("pages_read_user_content", f"{PAGE_ID}/ratings", True,
                   f"Found {len(data['data'])} ratings")
    else:
        log_result("pages_read_user_content", f"{PAGE_ID}/ratings", False,
                   f"Response: {json.dumps(data)[:100]}")


def test_pages_read_engagement():
    """
    Permission: pages_read_engagement
    Mục đích: Đọc engagement data (likes, comments, shares, reactions)
    """
    print("\n" + "="*60)
    print("Testing: pages_read_engagement")
    print("="*60)
    
    # Test 1: Get page insights (engagement metrics)
    data, error = make_request("GET", f"{PAGE_ID}/insights", {
        "metric": "page_engaged_users,page_post_engagements",
        "period": "day"
    })
    
    if error:
        log_result("pages_read_engagement", f"{PAGE_ID}/insights", False, f"Error: {error}")
    elif "data" in data:
        log_result("pages_read_engagement", f"{PAGE_ID}/insights", True,
                   f"Got {len(data['data'])} insight metrics")
    else:
        log_result("pages_read_engagement", f"{PAGE_ID}/insights", False,
                   f"Response: {json.dumps(data)[:100]}")
    
    # Test 2: Get posts with engagement data
    data, error = make_request("GET", f"{PAGE_ID}/posts", {
        "fields": "id,message,likes.summary(true),comments.summary(true),shares",
        "limit": 5
    })
    
    if error:
        log_result("pages_read_engagement", f"{PAGE_ID}/posts (engagement)", False, f"Error: {error}")
    elif "data" in data:
        post_count = len(data['data'])
        log_result("pages_read_engagement", f"{PAGE_ID}/posts (engagement)", True,
                   f"Got engagement for {post_count} posts")
    else:
        log_result("pages_read_engagement", f"{PAGE_ID}/posts (engagement)", False,
                   f"Response: {json.dumps(data)[:100]}")


def test_pages_manage_posts():
    """
    Permission: pages_manage_posts
    Mục đích: Tạo, sửa, xóa bài đăng trên page
    """
    print("\n" + "="*60)
    print("Testing: pages_manage_posts")
    print("="*60)
    
    # Test 1: Create a test post (unpublished/scheduled)
    test_message = f"[API Test] This is a test post created at {datetime.now().isoformat()}. Will be deleted."
    
    data, error = make_request("POST", f"{PAGE_ID}/feed", data={
        "message": test_message,
        "published": False  # Create as unpublished draft
    })
    
    if error:
        log_result("pages_manage_posts", f"{PAGE_ID}/feed (CREATE)", False, f"Error: {error}")
        return
    
    if "id" in data:
        post_id = data["id"]
        log_result("pages_manage_posts", f"{PAGE_ID}/feed (CREATE)", True,
                   f"Created unpublished post: {post_id}")
        
        # Test 2: Delete the test post
        del_data, del_error = make_request("DELETE", post_id)
        
        if del_error:
            log_result("pages_manage_posts", f"{post_id} (DELETE)", False, f"Error: {del_error}")
        elif del_data.get("success"):
            log_result("pages_manage_posts", f"{post_id} (DELETE)", True, "Post deleted successfully")
        else:
            log_result("pages_manage_posts", f"{post_id} (DELETE)", False,
                       f"Response: {json.dumps(del_data)[:100]}")
    else:
        log_result("pages_manage_posts", f"{PAGE_ID}/feed (CREATE)", False,
                   f"Response: {json.dumps(data)[:100]}")


def test_pages_manage_engagement():
    """
    Permission: pages_manage_engagement
    Mục đích: Quản lý comments, reactions, reply to messages
    """
    print("\n" + "="*60)
    print("Testing: pages_manage_engagement")
    print("="*60)
    
    # First, get a recent post to test comment on
    data, error = make_request("GET", f"{PAGE_ID}/posts", {
        "fields": "id,message",
        "limit": 1
    })
    
    if error or "data" not in data or len(data["data"]) == 0:
        log_result("pages_manage_engagement", "GET posts", False, 
                   "Cannot get posts to test engagement")
        return
    
    post_id = data["data"][0]["id"]
    
    # Test 1: Get comments on post
    comments_data, error = make_request("GET", f"{post_id}/comments", {
        "fields": "id,message,from,created_time",
        "limit": 5
    })
    
    if error:
        log_result("pages_manage_engagement", f"{post_id}/comments (READ)", False, f"Error: {error}")
    elif "data" in comments_data:
        log_result("pages_manage_engagement", f"{post_id}/comments (READ)", True,
                   f"Got {len(comments_data['data'])} comments")
        
        # Test 2: If there are comments, try to reply to one (as page)
        if len(comments_data["data"]) > 0:
            comment_id = comments_data["data"][0]["id"]
            
            # Create a reply comment
            reply_data, reply_error = make_request("POST", f"{comment_id}/comments", data={
                "message": "[API Test Reply] Thank you for your comment!"
            })
            
            if reply_error:
                log_result("pages_manage_engagement", f"{comment_id}/comments (REPLY)", False,
                           f"Error: {reply_error}")
            elif "id" in reply_data:
                reply_id = reply_data["id"]
                log_result("pages_manage_engagement", f"{comment_id}/comments (REPLY)", True,
                           f"Created reply: {reply_id}")
                
                # Clean up: delete the test reply
                del_data, _ = make_request("DELETE", reply_id)
                if del_data and del_data.get("success"):
                    print("       └── Test reply cleaned up")
            else:
                log_result("pages_manage_engagement", f"{comment_id}/comments (REPLY)", False,
                           f"Response: {json.dumps(reply_data)[:100]}")
    else:
        log_result("pages_manage_engagement", f"{post_id}/comments (READ)", False,
                   f"Response: {json.dumps(comments_data)[:100]}")


def test_business_management():
    """
    Permission: business_management
    Mục đích: Quản lý business assets, ad accounts, pages trong Business Manager
    """
    print("\n" + "="*60)
    print("Testing: business_management")
    print("="*60)
    
    # Test 1: Get businesses the user has access to
    data, error = make_request("GET", "me/businesses", {
        "fields": "id,name,created_time"
    })
    
    if error:
        log_result("business_management", "me/businesses", False, f"Error: {error}")
    elif "data" in data:
        log_result("business_management", "me/businesses", True,
                   f"Found {len(data['data'])} businesses")
        
        # If businesses exist, get more details about first one
        if len(data["data"]) > 0:
            business_id = data["data"][0]["id"]
            
            # Test 2: Get pages owned by business
            pages_data, pages_error = make_request("GET", f"{business_id}/owned_pages", {
                "fields": "id,name,access_token"
            })
            
            if pages_error:
                log_result("business_management", f"{business_id}/owned_pages", False,
                           f"Error: {pages_error}")
            elif "data" in pages_data:
                log_result("business_management", f"{business_id}/owned_pages", True,
                           f"Found {len(pages_data['data'])} owned pages")
            else:
                log_result("business_management", f"{business_id}/owned_pages", False,
                           f"Response: {json.dumps(pages_data)[:100]}")
    else:
        log_result("business_management", "me/businesses", False,
                   f"Response: {json.dumps(data)[:100]}")


def test_additional_permissions():
    """
    Test các permissions đã hoàn tất để verify
    """
    print("\n" + "="*60)
    print("Testing: Additional permissions (verification)")
    print("="*60)
    
    # pages_show_list - Get list of pages user manages
    data, error = make_request("GET", "me/accounts", {
        "fields": "id,name,access_token,category"
    })
    
    if error:
        log_result("pages_show_list", "me/accounts", False, f"Error: {error}")
    elif "data" in data:
        log_result("pages_show_list", "me/accounts", True,
                   f"Found {len(data['data'])} pages")
    
    # pages_manage_metadata - Get page metadata
    data, error = make_request("GET", PAGE_ID, {
        "fields": "id,name,about,category,phone,website,hours"
    })
    
    if error:
        log_result("pages_manage_metadata", PAGE_ID, False, f"Error: {error}")
    elif "id" in data:
        log_result("pages_manage_metadata", PAGE_ID, True,
                   f"Page: {data.get('name', 'N/A')}")


def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for r in test_results if r["success"])
    failed = sum(1 for r in test_results if not r["success"])
    
    print(f"\nTotal tests: {len(test_results)}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    
    if failed > 0:
        print("\nFailed tests:")
        for r in test_results:
            if not r["success"]:
                print(f"  - {r['permission']}: {r['endpoint']}")
                print(f"    {r['details'][:80]}")
    
    # Save results to file
    with open("scripts/fb_api_test_results.json", "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total": len(test_results),
                "passed": passed,
                "failed": failed
            },
            "results": test_results
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\nResults saved to: scripts/fb_api_test_results.json")


def main():
    print("="*60)
    print("FACEBOOK GRAPH API PERMISSION TEST")
    print("="*60)
    print(f"API Version: {GRAPH_API_VERSION}")
    print(f"Page ID: {PAGE_ID}")
    print(f"Token: {PAGE_ACCESS_TOKEN[:20]}..." if PAGE_ACCESS_TOKEN else "Token: NOT SET")
    
    if not PAGE_ACCESS_TOKEN:
        print("\n❌ ERROR: PAGE_ACCESS_TOKEN not set!")
        print("Please set FACEBOOK_PAGE_ACCESS_TOKEN in .env file")
        sys.exit(1)
    
    if not PAGE_ID:
        print("\n❌ ERROR: PAGE_ID not set!")
        print("Please set FACEBOOK_PAGE_ID in .env file")
        sys.exit(1)
    
    # Run tests for permissions that need API calls
    test_pages_read_user_content()
    test_pages_read_engagement()
    test_pages_manage_posts()
    test_pages_manage_engagement()
    test_business_management()
    
    # Verify already-completed permissions
    test_additional_permissions()
    
    # Print summary
    print_summary()


if __name__ == "__main__":
    main()
