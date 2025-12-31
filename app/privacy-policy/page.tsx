import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật | Trợ Lý Pháp Lý',
  description: 'Chính sách bảo mật và quyền riêng tư của ứng dụng Trợ Lý Pháp Lý',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Chính Sách Bảo Mật</h1>
      <p className="text-sm text-gray-500 mb-8">Cập nhật lần cuối: 25/12/2025</p>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Giới thiệu</h2>
          <p className="text-gray-700 mb-4">
            Chào mừng bạn đến với <strong>Trợ Lý Pháp Lý</strong> (trolyphaply.vn). Chúng tôi cam kết bảo vệ quyền riêng tư 
            và dữ liệu cá nhân của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, 
            và bảo vệ thông tin của bạn khi sử dụng dịch vụ của chúng tôi.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Thông tin chúng tôi thu thập</h2>
          <p className="text-gray-700 mb-4">Chúng tôi có thể thu thập các loại thông tin sau:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Thông tin tài khoản Facebook:</strong> Khi bạn kết nối trang Facebook với dịch vụ của chúng tôi, 
            chúng tôi thu thập ID trang, tên trang, và quyền truy cập cần thiết để quản lý tự động hóa.</li>
            <li><strong>Nội dung tương tác:</strong> Bình luận và tin nhắn trên các trang Facebook được kết nối 
            để thực hiện chức năng trả lời tự động.</li>
            <li><strong>Dữ liệu kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, thời gian truy cập để cải thiện dịch vụ.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Cách chúng tôi sử dụng thông tin</h2>
          <p className="text-gray-700 mb-4">Thông tin được thu thập được sử dụng để:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Cung cấp dịch vụ tự động trả lời bình luận và tin nhắn trên Facebook</li>
            <li>Cải thiện và tối ưu hóa trải nghiệm người dùng</li>
            <li>Phân tích thống kê và báo cáo hiệu suất</li>
            <li>Liên hệ hỗ trợ kỹ thuật khi cần thiết</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Bảo mật dữ liệu</h2>
          <p className="text-gray-700 mb-4">
            Chúng tôi áp dụng các biện pháp bảo mật nghiêm ngặt để bảo vệ dữ liệu của bạn:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Mã hóa AES-256 cho tất cả access tokens</li>
            <li>Kết nối HTTPS/SSL cho mọi giao tiếp</li>
            <li>Lưu trữ dữ liệu trên máy chủ bảo mật với Supabase</li>
            <li>Giới hạn quyền truy cập chỉ cho nhân viên được ủy quyền</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Chia sẻ thông tin</h2>
          <p className="text-gray-700 mb-4">
            Chúng tôi <strong>KHÔNG</strong> bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba 
            ngoại trừ các trường hợp sau:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Khi được yêu cầu bởi pháp luật</li>
            <li>Để bảo vệ quyền lợi hợp pháp của chúng tôi</li>
            <li>Với sự đồng ý rõ ràng của bạn</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Quyền của bạn</h2>
          <p className="text-gray-700 mb-4">Bạn có quyền:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Truy cập và xem dữ liệu cá nhân của bạn</li>
            <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
            <li>Yêu cầu xóa dữ liệu của bạn (xem trang <a href="/data-deletion" className="text-blue-600 hover:underline">Xóa dữ liệu</a>)</li>
            <li>Hủy kết nối tài khoản Facebook bất cứ lúc nào</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Lưu trữ dữ liệu</h2>
          <p className="text-gray-700 mb-4">
            Chúng tôi lưu trữ dữ liệu của bạn trong thời gian bạn sử dụng dịch vụ. Khi bạn yêu cầu xóa tài khoản 
            hoặc hủy kết nối, dữ liệu sẽ được xóa trong vòng 30 ngày.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Thay đổi chính sách</h2>
          <p className="text-gray-700 mb-4">
            Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được thông báo 
            trên trang này với ngày cập nhật mới.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Liên hệ</h2>
          <p className="text-gray-700 mb-4">
            Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:
          </p>
          <ul className="list-none text-gray-700 space-y-1">
            <li><strong>Email:</strong> support@trolyphaply.vn</li>
            <li><strong>Website:</strong> https://trolyphaply.vn</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
