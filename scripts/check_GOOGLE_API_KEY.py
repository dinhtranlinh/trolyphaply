import google.generativeai as genai
from google.api_core import exceptions

# --- CẤU HÌNH ---
# Dán danh sách các API Key của bạn vào đây
API_KEYS = [
    "AIzaSyD2Xl5R4SMbDwdm-lhqMlUkx8YngVymGCY",
    "AIzaSyCXBgNtBpjw263B1nP9fcw5DgRPj3tnOWY",
]
# ----------------

def check_key_models(api_key, index):
    print(f"\n{'='*10} Đang kiểm tra Key #{index + 1} {'='*10}")
    print(f"Key: {api_key[:10]}...******") # Chỉ hiện 1 phần key để bảo mật
    
    genai.configure(api_key=api_key)
    
    try:
        # Lấy danh sách các model
        models = genai.list_models()
        
        available_models = []
        for m in models:
            # Chỉ lấy các model hỗ trợ tạo nội dung (loại bỏ các model embedding nếu không cần)
            if 'generateContent' in m.supported_generation_methods:
                # Làm sạch tên model (bỏ đoạn models/ ở đầu)
                model_name = m.name.replace("models/", "")
                available_models.append(model_name)
        
        if available_models:
            print("✅ TRẠNG THÁI: HỢP LỆ")
            print(f"📋 Số lượng model truy cập được: {len(available_models)}")
            print("🔹 Danh sách Model:")
            for model in available_models:
                print(f"   - {model}")
        else:
            print("⚠️ Key hợp lệ nhưng không tìm thấy model nào hỗ trợ generateContent.")

    except exceptions.InvalidArgument:
        print("❌ TRẠNG THÁI: KHÔNG HỢP LỆ (Sai Key)")
    except exceptions.PermissionDenied:
        print("❌ TRẠNG THÁI: TỪ CHỐI TRUY CẬP (Quyền hạn hoặc Billing)")
    except Exception as e:
        print(f"❌ LỖI KHÁC: {str(e)}")

def main():
    if not API_KEYS or "YOUR_API_KEY" in API_KEYS[0]:
        print("❗ Vui lòng điền API Key thực tế vào biến API_KEYS trong file script.")
        return

    print(f"Bắt đầu kiểm tra {len(API_KEYS)} keys...")
    
    for i, key in enumerate(API_KEYS):
        check_key_models(key, i)
        
    print(f"\n{'='*10} HOÀN TẤT {'='*10}")

if __name__ == "__main__":
    main()