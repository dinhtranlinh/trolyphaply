"""
Lấy Page Access Token từ database để test Facebook API
=====================================================

Script này sẽ:
1. Kết nối Supabase
2. Lấy page đầu tiên từ facebook_pages
3. Decrypt token (nếu encrypted)
4. In ra thông tin để dùng với test_facebook_permissions.py

Usage:
    python scripts/get_page_token.py
"""

import os
import sys
from dotenv import load_dotenv

# Load .env
load_dotenv()

# Try to use supabase-py
try:
    from supabase import create_client
except ImportError:
    print("❌ Cần cài đặt supabase package:")
    print("   pip install supabase")
    sys.exit(1)

def main():
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("❌ Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env")
        sys.exit(1)
    
    supabase = create_client(url, key)
    
    # Lấy danh sách pages
    result = supabase.table("facebook_pages").select("*").execute()
    
    if not result.data:
        print("❌ Không tìm thấy page nào trong database")
        sys.exit(1)
    
    print("="*60)
    print("FACEBOOK PAGES IN DATABASE")
    print("="*60)
    
    for page in result.data:
        print(f"\nPage Name: {page.get('page_name')}")
        print(f"Page ID (Facebook): {page.get('page_id')}")
        print(f"Internal UUID: {page.get('id')}")
        print(f"Status: {page.get('status')}")
        
        token = page.get('access_token')
        if token:
            # Check if encrypted (format: iv:encrypted)
            if ":" in token and len(token) > 100:
                print(f"Token: [ENCRYPTED - {len(token)} chars]")
                print("⚠️  Token đang encrypted, cần decrypt trước khi dùng")
            else:
                print(f"Token: {token[:50]}...")
        else:
            print("Token: NOT SET")
        
        print("-"*40)
    
    # Hướng dẫn
    print("\n" + "="*60)
    print("HƯỚNG DẪN")
    print("="*60)
    print("""
Để test Facebook API, bạn có 2 cách:

1. Dùng token từ Graph API Explorer:
   - Vào https://developers.facebook.com/tools/explorer
   - Chọn App của bạn
   - Chọn Page Access Token
   - Chọn các permissions cần test
   - Generate Access Token
   - Copy token và chạy:
   
   set FACEBOOK_PAGE_ACCESS_TOKEN=<paste_token>
   set FACEBOOK_PAGE_ID=<page_id>
   python scripts/test_facebook_permissions.py

2. Dùng token đã có trong database (nếu không encrypted):
   - Copy token từ output ở trên
   - Chạy script tương tự

3. Nếu token bị encrypted:
   - Cần chạy Node.js script để decrypt
   - Hoặc lấy token mới từ Graph API Explorer
""")

if __name__ == "__main__":
    main()
