// Seed database with sample data
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAdminUser() {
  console.log('👤 Seeding admin user...');
  
  const email = 'admin@trolyphaply.vn';
  const password = 'TroLy@PhapLy2026';
  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      email,
      password: passwordHash,
    })
    .select()
    .single();

  if (error) {
    console.error('  ❌ Error seeding admin user:', error.message);
  } else {
    console.log(`  ✅ Admin user created: ${email}`);
  }
}

async function seedLegalDocuments() {
  console.log('\n📚 Seeding legal documents...');

  const documents = [
    {
      title: 'Bộ luật Dân sự 2015 (sửa đổi, bổ sung 2023)',
      doc_number: '91/2015/QH13',
      type: 'Bộ luật',
      authority: 'Quốc hội',
      issue_date: new Date('2015-11-24'),
      effective_date: new Date('2017-01-01'),
      summary: 'Quy định về các quan hệ dân sự, quyền và nghĩa vụ của chủ thể trong quan hệ dân sự',
      content: {
        chapters: [
          { number: 1, title: 'Những quy định chung', articles: 60 },
          { number: 2, title: 'Cá nhân', articles: 35 },
          { number: 3, title: 'Pháp nhân', articles: 28 },
          { number: 4, title: 'Đối tượng của quan hệ dân sự', articles: 45 },
        ],
      },
      tags: ['dân sự', 'quyền sở hữu', 'hợp đồng', 'thừa kế'],
      category: 'Dân sự',
    },
    {
      title: 'Luật Đất đai 2024',
      doc_number: '31/2024/QH15',
      type: 'Luật',
      authority: 'Quốc hội',
      issue_date: new Date('2024-01-18'),
      effective_date: new Date('2025-01-01'),
      summary: 'Quy định về chế độ quản lý, sử dụng đất đai và quyền, nghĩa vụ của người sử dụng đất',
      content: {
        chapters: [
          { number: 1, title: 'Những quy định chung', articles: 15 },
          { number: 2, title: 'Quyền sở hữu đất đai', articles: 12 },
          { number: 3, title: 'Quyền sử dụng đất', articles: 25 },
          { number: 4, title: 'Đăng ký đất đai', articles: 18 },
        ],
      },
      tags: ['đất đai', 'quyền sử dụng đất', 'sổ đỏ', 'đăng ký'],
      category: 'Đất đai',
    },
    {
      title: 'Bộ luật Lao động 2019',
      doc_number: '45/2019/QH14',
      type: 'Bộ luật',
      authority: 'Quốc hội',
      issue_date: new Date('2019-11-20'),
      effective_date: new Date('2021-01-01'),
      summary: 'Quy định về quyền, nghĩa vụ, trách nhiệm của người lao động và người sử dụng lao động',
      content: {
        chapters: [
          { number: 1, title: 'Những quy định chung', articles: 20 },
          { number: 2, title: 'Hợp đồng lao động', articles: 35 },
          { number: 3, title: 'Thời giờ làm việc, nghỉ ngơi', articles: 25 },
          { number: 4, title: 'Tiền lương', articles: 22 },
        ],
      },
      tags: ['lao động', 'hợp đồng lao động', 'bảo hiểm xã hội', 'tiền lương'],
      category: 'Lao động',
    },
    {
      title: 'Luật Doanh nghiệp 2020',
      doc_number: '59/2020/QH14',
      type: 'Luật',
      authority: 'Quốc hội',
      issue_date: new Date('2020-06-17'),
      effective_date: new Date('2021-01-01'),
      summary: 'Quy định về thành lập, tổ chức quản lý và hoạt động của doanh nghiệp',
      content: {
        chapters: [
          { number: 1, title: 'Những quy định chung', articles: 18 },
          { number: 2, title: 'Thành lập doanh nghiệp', articles: 15 },
          { number: 3, title: 'Công ty TNHH', articles: 28 },
          { number: 4, title: 'Công ty cổ phần', articles: 45 },
        ],
      },
      tags: ['doanh nghiệp', 'đăng ký kinh doanh', 'công ty', 'cổ phần'],
      category: 'Doanh nghiệp',
    },
  ];

  for (const doc of documents) {
    const { error } = await supabase.from('legal_documents').insert(doc);

    if (error) {
      console.error(`  ❌ Error seeding ${doc.title}:`, error.message);
    } else {
      console.log(`  ✅ ${doc.title}`);
    }
  }
}

async function seedProcedures() {
  console.log('\n📋 Seeding procedures...');

  const procedures = [
    {
      title: 'Thủ tục đăng ký kết hôn',
      authority: 'UBND cấp xã',
      time_est: '7-10 ngày làm việc',
      category: 'Hộ tịch',
      steps: [
        {
          step: 1,
          title: 'Chuẩn bị hồ sơ',
          description: 'Giấy tờ tùy thân, đơn đăng ký kết hôn, giấy khám sức khỏe',
        },
        {
          step: 2,
          title: 'Nộp hồ sơ',
          description: 'Nộp hồ sơ tại UBND xã/phường nơi cư trú',
        },
        {
          step: 3,
          title: 'Chờ xác minh',
          description: 'UBND xác minh điều kiện kết hôn (3-5 ngày)',
        },
        {
          step: 4,
          title: 'Nhận giấy chứng nhận',
          description: 'Đến UBND nhận giấy chứng nhận kết hôn',
        },
      ],
      documents: [
        'Chứng minh nhân dân/Căn cước công dân',
        'Đơn đăng ký kết hôn (mẫu)',
        'Giấy khám sức khỏe tiền hôn nhân',
        'Giấy xác nhận tình trạng hôn nhân',
      ],
      fees: '0 đồng (miễn phí)',
      notes: 'Cả hai bên phải có mặt khi đăng ký và nhận giấy',
      tags: ['hôn nhân', 'hộ tịch', 'đăng ký'],
    },
    {
      title: 'Thủ tục đăng ký kinh doanh',
      authority: 'Phòng Đăng ký kinh doanh',
      time_est: '3-5 ngày làm việc',
      category: 'Doanh nghiệp',
      steps: [
        {
          step: 1,
          title: 'Đặt tên doanh nghiệp',
          description: 'Kiểm tra trùng tên và đặt tên doanh nghiệp',
        },
        {
          step: 2,
          title: 'Chuẩn bị hồ sơ',
          description: 'Điều lệ, giấy tờ thành viên, địa chỉ trụ sở',
        },
        {
          step: 3,
          title: 'Nộp hồ sơ trực tuyến',
          description: 'Nộp qua Cổng thông tin quốc gia về đăng ký doanh nghiệp',
        },
        {
          step: 4,
          title: 'Nhận giấy phép',
          description: 'Nhận Giấy chứng nhận đăng ký doanh nghiệp',
        },
      ],
      documents: [
        'Đơn đăng ký doanh nghiệp',
        'Điều lệ công ty',
        'Danh sách thành viên sáng lập',
        'Bản sao CMND/CCCD',
        'Giấy tờ chứng minh địa chỉ trụ sở',
      ],
      fees: 'Khoảng 500.000 - 1.000.000 đồng',
      notes: 'Có thể làm online 100% qua Cổng DVC quốc gia',
      tags: ['doanh nghiệp', 'kinh doanh', 'đăng ký'],
    },
    {
      title: 'Thủ tục cấp giấy chứng nhận quyền sử dụng đất',
      authority: 'Văn phòng đăng ký đất đai',
      time_est: '30-45 ngày làm việc',
      category: 'Đất đai',
      steps: [
        {
          step: 1,
          title: 'Chuẩn bị hồ sơ',
          description: 'Giấy tờ chứng minh quyền sử dụng đất, sơ đồ thửa đất',
        },
        {
          step: 2,
          title: 'Nộp hồ sơ',
          description: 'Nộp tại Văn phòng đăng ký đất đai cấp huyện',
        },
        {
          step: 3,
          title: 'Đo đạc, khảo sát',
          description: 'Cơ quan chức năng đo đạc, xác định ranh giới',
        },
        {
          step: 4,
          title: 'Thẩm định hồ sơ',
          description: 'Kiểm tra tính hợp pháp của giấy tờ',
        },
        {
          step: 5,
          title: 'Nhận sổ đỏ',
          description: 'Nhận Giấy chứng nhận quyền sử dụng đất',
        },
      ],
      documents: [
        'Đơn đề nghị cấp GCN',
        'Giấy tờ về quyền sử dụng đất (hợp đồng, giấy tờ cũ...)',
        'Bản sao CMND/CCCD',
        'Sơ đồ thửa đất (nếu có)',
      ],
      fees: 'Phí đo đạc + phí cấp GCN (tùy diện tích)',
      notes: 'Thời gian có thể lâu hơn nếu hồ sơ phức tạp',
      tags: ['đất đai', 'sổ đỏ', 'quyền sử dụng đất'],
    },
    {
      title: 'Thủ tục đăng ký thường trú',
      authority: 'Công an xã/phường',
      time_est: '5-7 ngày làm việc',
      category: 'Hộ khẩu',
      steps: [
        {
          step: 1,
          title: 'Chuẩn bị hồ sơ',
          description: 'Giấy tờ tùy thân, giấy tờ chứng minh nơi ở',
        },
        {
          step: 2,
          title: 'Nộp hồ sơ',
          description: 'Nộp tại Công an xã/phường nơi đăng ký',
        },
        {
          step: 3,
          title: 'Xác minh',
          description: 'Công an xác minh nơi ở thực tế',
        },
        {
          step: 4,
          title: 'Nhận sổ hộ khẩu',
          description: 'Nhận sổ hộ khẩu mới hoặc cập nhật',
        },
      ],
      documents: [
        'Đơn đăng ký thường trú',
        'CMND/CCCD',
        'Sổ hộ khẩu cũ (nếu có)',
        'Giấy tờ chứng minh nơi ở (sổ đỏ, hợp đồng thuê...)',
      ],
      fees: '0 đồng (miễn phí)',
      notes: 'Đăng ký tại nơi có chỗ ở hợp pháp',
      tags: ['hộ khẩu', 'thường trú', 'công an'],
    },
  ];

  for (const proc of procedures) {
    const { error } = await supabase.from('procedures').insert(proc);

    if (error) {
      console.error(`  ❌ Error seeding ${proc.title}:`, error.message);
    } else {
      console.log(`  ✅ ${proc.title}`);
    }
  }
}

async function seedPrompts() {
  console.log('\n💡 Seeding prompts...');

  const prompts = [
    {
      title: 'Phân tích hợp đồng mua bán',
      body: `Bạn là luật sư chuyên nghiệp có kinh nghiệm về hợp đồng dân sự.

Hãy phân tích hợp đồng sau và đưa ra nhận xét:

HỢP ĐỒNG:
{{contract_text}}

Yêu cầu phân tích:
1. Các điều khoản chính trong hợp đồng
2. Quyền và nghĩa vụ của từng bên
3. Các rủi ro tiềm ẩn (nếu có)
4. Các điều khoản cần bổ sung hoặc làm rõ
5. Tính hợp pháp và khả thi của hợp đồng

Hãy trả lời chi tiết, rõ ràng và dễ hiểu.`,
      category: 'Pháp luật',
      tags: ['hợp đồng', 'dân sự', 'phân tích'],
      is_public: true,
    },
    {
      title: 'Tư vấn thuế thu nhập cá nhân',
      body: `Bạn là chuyên gia tư vấn thuế.

Thông tin:
- Thu nhập hàng tháng: {{monthly_income}} VNĐ
- Số người phụ thuộc: {{dependents}}
- Các khoản giảm trừ khác: {{other_deductions}}

Hãy tính toán và giải thích:
1. Thuế thu nhập cá nhân phải nộp hàng tháng
2. Các khoản giảm trừ được hưởng
3. Thu nhập sau thuế
4. Cách tối ưu thuế (nếu có)

Sử dụng biểu thuế lũy tiến từng phần theo quy định hiện hành của Việt Nam.`,
      category: 'Thuế',
      tags: ['thuế', 'thu nhập cá nhân', 'tính thuế'],
      is_public: true,
    },
    {
      title: 'Soạn đơn khiếu nại hành chính',
      body: `Bạn là luật sư chuyên về tố tụng hành chính.

Thông tin vụ việc:
- Người khiếu nại: {{complainant_name}}
- Cơ quan bị khiếu nại: {{authority_name}}
- Nội dung khiếu nại: {{complaint_content}}
- Thiệt hại (nếu có): {{damages}}

Hãy soạn đơn khiếu nại theo đúng quy định pháp luật, bao gồm:
1. Phần mở đầu (thông tin người khiếu nại)
2. Nội dung khiếu nại (diễn biến sự việc)
3. Căn cứ pháp lý
4. Yêu cầu của người khiếu nại
5. Phần kết

Văn phong trang trọng, rõ ràng, có căn cứ pháp lý cụ thể.`,
      category: 'Văn bản pháp lý',
      tags: ['khiếu nại', 'hành chính', 'văn bản'],
      is_public: true,
    },
    {
      title: 'Giải thích điều luật đơn giản',
      body: `Bạn là chuyên gia pháp luật giỏi giải thích các quy định phức tạp theo cách dễ hiểu.

Điều luật cần giải thích:
{{law_article}}

Hãy giải thích điều luật này theo cách:
1. Ngắn gọn, dễ hiểu
2. Sử dụng ví dụ thực tế
3. Nêu rõ quyền và nghĩa vụ
4. Lưu ý các trường hợp đặc biệt

Đối tượng đọc là người dân thường, không có kiến thức pháp luật chuyên sâu.`,
      category: 'Giải thích pháp luật',
      tags: ['giải thích', 'pháp luật', 'đơn giản'],
      is_public: true,
    },
  ];

  for (const prompt of prompts) {
    const { error } = await supabase.from('prompts').insert(prompt);

    if (error) {
      console.error(`  ❌ Error seeding ${prompt.title}:`, error.message);
    } else {
      console.log(`  ✅ ${prompt.title}`);
    }
  }
}

async function main() {
  console.log('🌱 Starting database seeding...\n');

  await seedAdminUser();
  await seedLegalDocuments();
  await seedProcedures();
  await seedPrompts();

  console.log('\n✨ Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('  ✅ 1 admin user');
  console.log('  ✅ 4 legal documents');
  console.log('  ✅ 4 procedures');
  console.log('  ✅ 4 prompts');
  console.log('\n🎉 Ready for SESSION 2!');
}

main().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
