import os
import requests

# NOTE: Do NOT hardcode tokens here. Load from ENV instead.

API_VERSION = "v24.0"
BASE_URL = f"https://graph.facebook.com/{API_VERSION}"


def load_env_file(filename: str) -> None:
    if not os.path.exists(filename):
        return
    with open(filename, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip("\"'")
            if key and key not in os.environ:
                os.environ[key] = value


load_env_file(".env")
load_env_file(".env.local")

ACCESS_TOKEN = (
    os.environ.get("FACEBOOK_PAGE_ACCESS_TOKEN")
    or os.environ.get("FACEBOOK_USER_ACCESS_TOKEN")
    or ""
).strip()

REPLY_MESSAGE = "Thanks for your comment!"
PRIVATE_MESSAGE = "Hello, thanks for your message."


def get_page_access_token():
    url = f"{BASE_URL}/me/accounts"
    resp = requests.get(url, params={"access_token": ACCESS_TOKEN})
    if resp.status_code == 200 and resp.json().get("data"):
        page = resp.json()["data"][0]
        return page["id"], page["access_token"]
    return None, None


def reply_to_comment(comment_id: str, page_token: str) -> None:
    url = f"{BASE_URL}/{comment_id}/comments"
    data = {"message": REPLY_MESSAGE, "access_token": page_token}
    resp = requests.post(url, data=data)
    if resp.status_code == 200:
        print(f"PASS: Replied to comment {comment_id}")
    else:
        print(f"FAIL: Reply error: {resp.text}")


def send_private_reply(comment_id: str, page_token: str) -> None:
    url = f"{BASE_URL}/{comment_id}/private_replies"
    data = {"message": PRIVATE_MESSAGE, "access_token": page_token}
    resp = requests.post(url, data=data)
    if resp.status_code == 200:
        print(f"PASS: Private reply to {comment_id}")
    else:
        print(f"WARN: Private reply error: {resp.text}")


def process_latest_post():
    if not ACCESS_TOKEN:
        print("FAIL: Missing FACEBOOK_PAGE_ACCESS_TOKEN or FACEBOOK_USER_ACCESS_TOKEN")
        return

    page_id, page_token = get_page_access_token()
    if not page_token:
        print("FAIL: Could not fetch page token")
        return

    feed_url = f"{BASE_URL}/{page_id}/feed"
    feed_resp = requests.get(feed_url, params={"access_token": page_token, "limit": 1})

    if feed_resp.status_code == 200 and feed_resp.json().get("data"):
        post = feed_resp.json()["data"][0]
        post_id = post["id"]

        comment_url = f"{BASE_URL}/{post_id}/comments"
        comment_resp = requests.get(comment_url, params={"access_token": page_token})
        comments = comment_resp.json().get("data", [])

        for comment in comments:
            reply_to_comment(comment["id"], page_token)
            send_private_reply(comment["id"], page_token)
    else:
        print("WARN: No posts found or error fetching feed")


if __name__ == "__main__":
    process_latest_post()
