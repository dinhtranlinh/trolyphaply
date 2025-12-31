import requests
import json

# ================= CẤU HÌNH =================
# 1. Dán Token của bạn vào đây (Vẫn dùng token cũ nếu chưa hết hạn)
ACCESS_TOKEN = "EAAMKyXrvBYYBQXs2CjL98AlNzXijbZBXZC51SbibqEP6ISUTNJVfpBmyqP22pZB6Vhtty2WjeNdPTuEIKlbZCyoajWs6ygR8ly0etGZAd7Hm31fZAsDuEgLHX8ZCR9n8AXyuDbOfAu5DmZAmR97xlmwUCXhwpXh29BzikFVeQFYkGEBZCkuNkjbZBAc3YfNv78bYpx9PYAgrMq6HkUZCDZCETWZBDPZBIE76b1FA7vEoewTVKhRjD3ZBVooZCxLdCYyYDyWZABUz7aLyIm8eri3ueZAlRvtp02oAZDZD"
API_VERSION = "v24.0"
BASE_URL = f"https://graph.facebook.com/{API_VERSION}"

# 2. Nội dung bạn muốn hệ thống tự động trả lời
REPLY_MESSAGE = "Cảm ơn bạn đã quan tâm! Shop sẽ inbox tư vấn chi tiết ngay ạ. ❤️"
PRIVATE_MESSAGE = "Chào bạn, mình thấy bạn quan tâm đến bài viết. Bạn cần hỗ trợ gì không ạ?"

def get_page_access_token():
    """Lấy Token riêng của Page (Bắt buộc để reply)"""
    url = f"{BASE_URL}/me/accounts"
    resp = requests.get(url, params={'access_token': ACCESS_TOKEN})
    if resp.status_code == 200 and resp.json().get('data'):
        # Lấy Page đầu tiên tìm thấy
        page = resp.json()['data'][0]
        return page['id'], page['access_token']
    return None, None

def reply_to_comment(comment_id, page_token):
    """Trả lời bình luận công khai"""
    url = f"{BASE_URL}/{comment_id}/comments"
    data = {'message': REPLY_MESSAGE, 'access_token': page_token}
    resp = requests.post(url, data=data)
    if resp.status_code == 200:
        print(f"✅ Đã trả lời comment {comment_id} thành công!")
    else:
        print(f"❌ Lỗi trả lời: {resp.text}")

def send_private_reply(comment_id, page_token):
    """Gửi tin nhắn riêng từ bình luận (Private Reply)"""
    url = f"{BASE_URL}/{comment_id}/private_replies"
    data = {'message': PRIVATE_MESSAGE, 'access_token': page_token}
    resp = requests.post(url, data=data)
    if resp.status_code == 200:
        print(f"✅ Đã gửi tin nhắn riêng cho comment {comment_id}!")
    else:
        # Lỗi thường gặp: Tin nhắn đã được gửi rồi (Facebook chỉ cho gửi 1 lần/comment)
        print(f"⚠️ Không gửi được inbox (Có thể đã gửi rồi): {resp.text}")

def process_latest_post():
    # 1. Lấy thông tin Page và Token Page
    page_id, page_token = get_page_access_token()
    if not page_token:
        print("Không lấy được Page Token.")
        return

    # 2. Lấy bài viết mới nhất
    print(f"--- Đang quét bài viết trên Page ID: {page_id} ---")
    feed_url = f"{BASE_URL}/{page_id}/feed"
    feed_resp = requests.get(feed_url, params={'access_token': page_token, 'limit': 1})
    
    if feed_resp.status_code == 200 and feed_resp.json().get('data'):
        post = feed_resp.json()['data'][0]
        post_id = post['id']
        print(f"Đang kiểm tra bài viết: {post.get('message', '')[:30]}...")
        
        # 3. Lấy danh sách bình luận của bài viết
        comment_url = f"{BASE_URL}/{post_id}/comments"
        comment_resp = requests.get(comment_url, params={'access_token': page_token})
        
        comments = comment_resp.json().get('data', [])
        print(f"Tìm thấy {len(comments)} bình luận.")
        
        # 4. Duyệt qua từng comment để trả lời
        for comment in comments:
            # Ở đây bạn có thể thêm logic: Nếu chưa trả lời thì mới trả lời
            # (Hiện tại code này sẽ trả lời mọi comment tìm thấy)
            print(f"\nĐang xử lý comment của: {comment.get('from', {}).get('name')}")
            
            # A. Trả lời công khai (Comment)
            reply_to_comment(comment['id'], page_token)
            
            # B. Gửi tin nhắn riêng (Inbox)
            send_private_reply(comment['id'], page_token)
            
    else:
        print("Không tìm thấy bài viết nào.")

if __name__ == "__main__":
    process_latest_post()