import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hướng Dẫn Xóa Dữ Liệu | Trợ Lý Pháp Lý',
  description: 'Hướng dẫn cách yêu cầu xóa dữ liệu cá nhân từ ứng dụng Trợ Lý Pháp Lý',
};

export default function DataDeletionPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Hướng Dẫn Xóa Dữ Liệu</h1>
      <p className="text-sm text-gray-500 mb-8">Cập nhật lần cuối: 25/12/2025</p>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quyền xóa dữ liệu của bạn</h2>
          <p className="text-gray-700 mb-4">
            Theo quy định về bảo vệ dữ liệu, bạn có quyền yêu cầu xóa tất cả dữ liệu cá nhân mà 
            <strong> Trợ Lý Pháp Lý</strong> đã thu thập thông qua việc kết nối với tài khoản Facebook của bạn.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dữ liệu sẽ được xóa</h2>
          <p className="text-gray-700 mb-4">Khi bạn yêu cầu xóa dữ liệu, chúng tôi sẽ xóa:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Thông tin kết nối Facebook (access tokens đã mã hóa)</li>
            <li>Danh sách các trang Facebook đã kết nối</li>
            <li>Quy tắc trả lời tự động bạn đã tạo</li>
            <li>Lịch sử các sự kiện webhook đã nhận</li>
            <li>Nhật ký hoạt động tự động hóa</li>
            <li>Thống kê và phân tích liên quan đến tài khoản của bạn</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cách yêu cầu xóa dữ liệu</h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Phương pháp 1: Qua Facebook</h3>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Truy cập <a href="https://www.facebook.com/settings?tab=applications" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Cài đặt Facebook → Ứng dụng và trang web</a></li>
              <li>Tìm ứng dụng <strong>"QuanLyPage"</strong> hoặc <strong>"Trợ Lý Pháp Lý"</strong></li>
              <li>Nhấn <strong>"Xóa"</strong> để gỡ ứng dụng</li>
              <li>Chọn <strong>"Xóa tất cả bài đăng, ảnh và video"</strong> nếu muốn xóa hoàn toàn</li>
            </ol>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Phương pháp 2: Gửi email trực tiếp</h3>
            <p className="text-gray-700 mb-2">Gửi email đến <strong>support@trolyphaply.vn</strong> với nội dung:</p>
            <div className="bg-white p-4 rounded border font-mono text-sm">
              <p><strong>Tiêu đề:</strong> Yêu cầu xóa dữ liệu - [Tên của bạn]</p>
              <p className="mt-2"><strong>Nội dung:</strong></p>
              <p>- Facebook User ID: [ID của bạn]</p>
              <p>- Tên các trang Facebook đã kết nối</p>
              <p>- Xác nhận: "Tôi yêu cầu xóa toàn bộ dữ liệu của tôi"</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Phương pháp 3: Sử dụng API</h3>
            <p className="text-gray-700 mb-2">Gọi API xóa dữ liệu (dành cho developer):</p>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
              <code>POST https://trolyphaply.vn/api/facebook/data-deletion</code>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Thời gian xử lý</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Yêu cầu qua Facebook:</strong> Xử lý tự động trong vòng 24 giờ</li>
            <li><strong>Yêu cầu qua email:</strong> Xử lý trong vòng 3-5 ngày làm việc</li>
            <li><strong>Xác nhận:</strong> Bạn sẽ nhận được email xác nhận sau khi hoàn tất</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lưu ý quan trọng</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Việc xóa dữ liệu là <strong>không thể hoàn tác</strong></li>
              <li>Sau khi xóa, bạn sẽ cần kết nối lại nếu muốn sử dụng dịch vụ</li>
              <li>Các quy tắc tự động hóa và cài đặt sẽ bị mất vĩnh viễn</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Liên hệ hỗ trợ</h2>
          <p className="text-gray-700 mb-4">
            Nếu bạn gặp khó khăn trong việc xóa dữ liệu hoặc có câu hỏi, vui lòng liên hệ:
          </p>
          <ul className="list-none text-gray-700 space-y-1">
            <li><strong>Email:</strong> support@trolyphaply.vn</li>
            <li><strong>Website:</strong> https://trolyphaply.vn</li>
          </ul>
        </section>

        <section className="mb-8">
          <p className="text-gray-600 text-sm">
            Xem thêm: <a href="/privacy-policy" className="text-blue-600 hover:underline">Chính sách bảo mật</a>
          </p>
        </section>
      </div>
    </div>
  );
}
