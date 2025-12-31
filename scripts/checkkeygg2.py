import google.generativeai as genai
from google.api_core import exceptions
import time

# ==========================================
# CẤU HÌNH DANH SÁCH KEY CỦA BẠN
# ==========================================
MY_KEYS = [
   "AIzaSyAURq8JNTfVhd2YNyXf7ZRGCQymLvQWmis",
    "AIzaSyC4RV8rJ9K6JeQj7xfroLI0AcGhcVjvpUw",
    "AIzaSyCXBgNtBpjw263B1nP9fcw5DgRPj3tnOWY",
    "AIzaSyBEJvV_qYX7bH4WYKSWcQ0fIr5wa5AVWXI",
    "AIzaSyD2Xl5R4SMbDwdm-lhqMlUkx8YngVymGCY",
    "AIzaSyCvFEWYk0rm39wy5V6oyPGjm1C3lMCidq4",
    "AIzaSyC8oNsIio8DpvALlAArlYX19dpwRzFuspQ",
    "AIzaSyBrlt9K9m4WARAbrXuB_5gwGTHxIBGGjEM",
    "AIzaSyDcuZ-DHRLp5xxGWc4YNGHZwhM2giTgAug",
    "AIzaSyDEN7LewFrwBM0qyk6FKvkMeSkfvw3BLWA",
    "AIzaSyBTj7lbU_lGVVg8ymr5wK6qUoxyqG4dNw0",
    "AIzaSyCbwZtocZCIkrTy86vxYKRiJzg0OSOdGLk",
    "AIzaSyCJPBK6Kq4wQuelvOdbi80G89E5YOfoZw0",
]

# Các model quan trọng cần test khả năng hoạt động (Ưu tiên từ mới đến cũ)
PRIORITY_MODELS = [
    "gemini-2.5-flash",    # Model mới nhất (Hy vọng cao nhất)
    "gemini-2.0-flash",    # Model thường bị Limit = 0
    "gemini-1.5-flash",    # Model ổn định cũ
    "gemini-1.5-pro",      # Model Pro (thường tốn phí hoặc ít quota)
]

def analyze_key(api_key, index):
    masked_key = f"...{api_key[-6:]}"
    print(f"\n{'='*15} KIỂM TRA KEY #{index + 1} ({masked_key}) {'='*15}")
    
    genai.configure(api_key=api_key)
    report = {
        "key_index": index + 1,
        "masked_key": masked_key,
        "valid_syntax": False,
        "working_models": [],
        "quota_status": "Chưa xác định",
        "billing_required": False
    }

    # BƯỚC 1: Lấy danh sách Model (Kiểm tra xem Key có hợp lệ và Project có active không)
    try:
        available_models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                name = m.name.replace("models/", "")
                available_models.append(name)
        
        report["valid_syntax"] = True
        print(f"📋 Danh sách Model nhìn thấy: {len(available_models)} models")
        # print(f"   (Ví dụ: {', '.join(available_models[:5])}...)") # Bỏ comment nếu muốn xem list dài

    except exceptions.InvalidArgument:
        print("❌ KEY KHÔNG HỢP LỆ (Sai ký tự)")
        report["quota_status"] = "Key Sai"
        return report
    except Exception as e:
        print(f"❌ Lỗi kết nối lấy danh sách: {str(e)}")
        report["quota_status"] = "Lỗi Mạng/Project"
        return report

    # BƯỚC 2: Test thực tế (Gửi request)
    print("🚀 Đang test khả năng gửi tin nhắn (Quota Check):")
    
    # Nếu list model không chứa gemini-1.5-flash trở lên, khả năng cao là key cũ hoặc project lỗi
    if not available_models:
        print("⚠️ Cảnh báo: Key hợp lệ nhưng không thấy model nào hỗ trợ generateContent.")
    
    for model_name in PRIORITY_MODELS:
        status_icon = "❓"
        note = ""
        
        try:
            model = genai.GenerativeModel(model_name)
            start_time = time.time()
            # Gọi cực ngắn để test
            response = model.generate_content("Hi", generation_config={"max_output_tokens": 1})
            elapsed = time.time() - start_time
            
            status_icon = "✅"
            note = f"OK ({elapsed:.2f}s)"
            report["working_models"].append(model_name)
            
        except exceptions.ResourceExhausted as e:
            status_icon = "⛔" # 429
            if "limit: 0" in str(e).lower() or "quota" in str(e).lower():
                note = "HẾT QUOTA / LIMIT=0 (Free Tier chặn)"
            else:
                note = "QUÁ TẢI (Rate Limit)"
        except exceptions.PermissionDenied:
            status_icon = "💲" # 403
            note = "CẦN BILLING / KHÔNG CÓ QUYỀN"
            report["billing_required"] = True
        except exceptions.NotFound:
            status_icon = "❌" # 404
            note = "MODEL KHÔNG TỒN TẠI (Trong Project này)"
        except Exception as e:
            status_icon = "⚠️"
            note = f"Lỗi khác: {str(e)[:50]}..."

        print(f"   {status_icon} [{model_name:<18}]: {note}")

    # Đánh giá cuối cùng cho Key
    if len(report["working_models"]) > 0:
        report["quota_status"] = "🟢 CÒN QUOTA (Dùng được)"
    elif report["billing_required"]:
        report["quota_status"] = "🔴 CẦN BILLING"
    elif report["valid_syntax"]:
        report["quota_status"] = "🟠 HẾT QUOTA / LIMIT=0"
        
    return report

def main():
    if not MY_KEYS:
        print("Vui lòng điền Key vào biến MY_KEYS")
        return

    summary = []
    print(f"Đang phân tích {len(MY_KEYS)} Keys... Vui lòng đợi.")
    
    for i, key in enumerate(MY_KEYS):
        result = analyze_key(key, i)
        summary.append(result)
        time.sleep(1) # Nghỉ nhẹ tránh spam tool

    # BƯỚC 3: Tổng hợp báo cáo
    print("\n" + "="*60)
    print(f"{'BẢNG TỔNG HỢP KHUYẾN NGHỊ':^60}")
    print("="*60)
    print(f"{'Key':<10} | {'Trạng Thái':<25} | {'Model Tốt Nhất Để Dùng':<20}")
    print("-" * 60)

    for item in summary:
        best_model = "Không có"
        if item["working_models"]:
            # Ưu tiên lấy model đầu tiên trong danh sách ưu tiên mà key này chạy được
            best_model = item["working_models"][0] 
        
        status = item["quota_status"]
        idx = f"Key #{item['key_index']}"
        
        print(f"{idx:<10} | {status:<25} | {best_model:<20}")

    print("="*60)
    print("💡 MẸO: Hãy dùng key có trạng thái '🟢' và set biến MODEL_NAME theo cột 'Model Tốt Nhất'.")

if __name__ == "__main__":
    main()