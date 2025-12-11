/**
 * Seed script to create 2 mini apps from old database
 * Run: npx tsx prisma/seed-apps.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding apps...\n');

  // APP 1: Vận Mệnh 2025
  const vanMenhApp = {
    slug: 'van-menh',
    name: 'Xem Vận Mệnh 2025',
    description: 'Khám phá vận mệnh của bạn qua Tứ Trụ, Kinh Dịch và Tử Vi với AI',
    category: 'mini_app',
    type: 'image_canvas',
    status: 'active' as const,
    
    inputSchema: {
      fields: [
        {
          name: 'dob',
          type: 'date',
          label: 'Ngày sinh (Dương lịch)',
          placeholder: 'DD/MM/YYYY',
          required: true,
          description: 'Chọn ngày sinh theo dương lịch'
        },
        {
          name: 'gender',
          type: 'radio',
          label: 'Giới tính',
          required: true,
          options: [
            { value: 'Nam', label: '♂️ Nam' },
            { value: 'Nữ', label: '♀️ Nữ' }
          ]
        }
      ]
    },
    
    promptTemplate: `Bạn là "Thầy Phán AI" hệ tư tưởng Gen Z: Am hiểu Tử Vi, Tứ Trụ nhưng văn phong hiện đại, "xéo xắt" yêu thương, dùng từ ngữ trendy (slang) mà giới trẻ thích nghe.

INPUT DỮ LIỆU:
- Ngày sinh: {{dob}}
- Giới tính: {{gender}}
(Chỉ định danh bằng Can Chi, không cần tên thật).

NHIỆM VỤ CỦA BẠN:
1. Xử lý dữ liệu: 
   - Từ năm sinh, tự tính tuổi Âm Lịch (Can Chi) và Mệnh Ngũ Hành.

2. CƠ CHẾ "RANDOM FOCUS" (TẠO SỰ KHÁC BIỆT):
   - Thay vì nói chung chung, hãy CHỌN NGẪU NHIÊN 1 trong 4 kịch bản sau để "phán" phần Tương lai:
     + Kịch bản A (Tiền Tỉ): Tập trung vào tài lộc, đầu tư, trúng số, nổ đơn.
     + Kịch bản B (Thoát Ế/Cưới Xin): Tập trung vào tình duyên, đào hoa, người yêu cũ/mới.
     + Kịch bản C (Thăng Quan): Tập trung vào sự nghiệp, làm sếp, nhảy việc thành công.
     + Kịch bản D (Quý Nhân): Tập trung vào may mắn bất ngờ, được người giúp, gặp thầy gặp thuốc.

3. VIẾT NỘI DUNG JSON (Tuân thủ độ dài):
   - Header: "Kính gửi Quý [anh/cô] [Can Chi] - [Năm sinh] mệnh [Mệnh]"
   - Title: Đặt danh xưng theo Kịch bản đã chọn. (VD chọn Tiền thì title là "Phú Bà Tương Lai", "Chủ Tịch Ngầm").
   
   - Past (Quá Khứ): Tối đa 50 từ.
     + Nhắc nhẹ nỗi đau cũ (bị lừa, gánh team, hao tài...) để tạo sự đồng cảm.
   
   - Future (Tương Lai): Khoảng 110 - 130 từ (Tỷ lệ 70%).
     + Phải xoáy sâu vào Kịch bản đã chọn ở bước 2.
     + Văn phong: Như một người bạn thân đang mách nước. Dùng từ mạnh: "Vũ trụ gửi tín hiệu", "Thời tới cản không kịp", "Check var uy tín".
     + Chia làm 2-3 câu dài, diễn giải cụ thể viễn cảnh tốt đẹp để người đọc có hy vọng.
     
   - Quote: Một câu slogan ngắn, chất chơi.
   
   - Share Caption: Một đoạn caption ngắn (30-50 từ) để người dùng chia sẻ lên mạng xã hội. Nội dung cần:
     + Khoe kết quả vận mệnh mình vừa xem (nhắc nhẹ title hoặc kịch bản đã chọn)
     + Mời gọi người khác thử app bói AI
     + Văn phong Gen Z, hài hước, catchy, dùng emoji

4. Output Format: Trả về duy nhất JSON (Không Markdown):
{
  "header_address": "Kính gửi Quý cô Canh Thìn - 2000 mệnh Kim",
  "title": "Danh xưng (VD: Chiến Thần Hốt Bạc)",
  "past_analysis": "Đoạn văn ngắn (Max 50 từ). Ví dụ: Năm qua đúng là 'kiếp nạn thứ 82', cung Nô Bộc báo hiệu bạn toàn gặp người 'hứa thật nhiều thất hứa thật nhiều', làm 10 hưởng 1, gánh team còng lưng.",
  "future_prediction": "Đoạn văn chi tiết (110-130 từ). Ví dụ: Nhưng hãy chuẩn bị tinh thần đi, vận thế 2025 quay xe cực gắt! Cung Tài Bạch của bạn đang sáng nhất hệ mặt trời, báo hiệu dòng tiền sẽ đổ về ồ ạt từ các nguồn đầu tư cũ hoặc nghề tay trái. Vũ trụ đang 'ting ting' tín hiệu giàu sang, bạn sẽ có cơ hội chốt được những hợp đồng lớn hoặc được tăng lương đột biến vào giữa năm. Đừng ngại thử sức lĩnh vực mới, vì sao Thiên Lộc đang chiếu mệnh, đụng đâu thắng đó. Tiền vào như nước sông Đà, tha hồ mà 'flex' cuộc sống sang chảnh nhé!",
  "lucky_info": "Số may mắn: 79, 68 | Màu: Vàng Kim",
  "daily_quote": "Ngồi im tình yêu không tới, nhưng ngồi im tiền sẽ tới!",
  "share_caption": "Tôi vừa bị Thầy AI 'bóc phốt' là Chiến Thần Hốt Bạc năm 2026 luôn 💰🔥 Vũ trụ đang gửi tín hiệu 'ting ting' về tài lộc đấy! Bạn cũng muốn biết mình thuộc kiếp gì không? Thử ngay app bói AI này, chuẩn xác hơn nghề xem tay 😂🔮"
}`,

    outputSchema: {
      type: 'object',
      properties: {
        header_address: { type: 'string' },
        title: { type: 'string' },
        past_analysis: { type: 'string' },
        future_prediction: { type: 'string' },
        lucky_info: { type: 'string' },
        daily_quote: { type: 'string' },
        share_caption: { type: 'string' }
      }
    },

    renderConfig: {
      canvasWidth: 1080,
      canvasHeight: 1350,
      backgroundFolder: '/backgrounds/tu-vi',
      layout: {
        header: { y: 250, height: 100 },
        title: { y: 350, height: 100 },
        pastAnalysis: { y: 450, height: 200, color: '#9CA3AF' },
        futureAnalysis: { y: 650, height: 400, color: '#FFD700' },
        footer: { y: 1100, height: 250 }
      },
      fonts: {
        header: { family: 'Merriweather', size: 32, color: '#F8FAFC' },
        title: { family: 'Yeseva One', size: 60, color: '#FFD700', bold: true },
        body: { family: 'Montserrat', size: 28, lineHeight: 1.5 },
        quote: { family: 'Patrick Hand', size: 36, color: '#F97316' }
      },
      separators: {
        afterTitle: '/icons/yin-yang.svg',
        beforeFooter: '/icons/sparkle.svg'
      }
    },
    
    shareConfig: {
      title: 'Vận Mệnh Của Tôi - Xem Tử Vi 2025',
      description: 'Khám phá vận mệnh qua Can Chi và Tử Vi với AI. Bạn thuộc mệnh gì? Sao nào đang chiếu?',
      hashtags: ['#TửVi2025', '#XemVậnMệnh', '#CanChi', '#TửViAI']
    },

    limits: {
      model: {
        provider: 'gemini',
        name: 'gemini-2.5-flash',
        temperature: 0.8,
        responseMimeType: 'application/json'
      },
      maxRequestsPerDay: 1000
    }
  };

  // APP 2: Thư Pháp Tên Gia Đình
  const thuPhapApp = {
    slug: 'thu-phap',
    name: 'Thư Pháp Tên Gia Đình',
    description: 'Tạo các câu thư pháp ý nghĩa từ tên các thành viên trong gia đình',
    category: 'mini_app',
    status: 'active' as const,
    type: 'text_only',
    
    inputSchema: {
      fields: [
        {
          name: 'names',
          label: 'Tên các thành viên (mỗi tên một dòng)',
          type: 'textarea',
          required: true,
          placeholder: 'Ví dụ:\nNguyễn Văn A\nTrần Thị B\nLê Văn C',
          description: 'Nhập tên của từng thành viên, mỗi tên trên một dòng',
          maxLength: 500,
        },
        {
          name: 'style',
          label: 'Phong cách',
          type: 'select',
          required: true,
          options: ['Cổ điển', 'Hiện đại', 'Trẻ trung', 'Sang trọng'],
          description: 'Chọn phong cách cho các câu thư pháp',
        },
      ],
    },
    
    promptTemplate: `Bạn là một người viết thư pháp chuyên nghiệp. Nhiệm vụ của bạn là tạo ra các câu thư pháp ý nghĩa, đẹp và sâu sắc dựa trên tên các thành viên trong gia đình.

Danh sách tên: {{names}}
Phong cách: {{style}}

Hãy tạo 5 câu thư pháp (4 chữ mỗi câu) có ý nghĩa về gia đình, tình cảm, hạnh phúc. Mỗi câu nên kết hợp chữ cái đầu của các tên hoặc có liên quan đến ý nghĩa của tên.

Trả về JSON theo format:
{
  "phrases": ["câu 1", "câu 2", "câu 3", "câu 4", "câu 5"]
}`,
    
    outputSchema: {
      type: 'object',
      properties: {
        phrases: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
    
    renderConfig: {},
    
    shareConfig: {
      title: 'Thư Pháp Tên Gia Đình',
      description: 'Xem các câu thư pháp ý nghĩa từ tên gia đình tôi!',
      hashtags: ['ThuPhap', 'GiaDinh', 'TrendFactory'],
    },
    
    limits: {
      maxSubmitsPerDay: 100,
      maxSubmitsPerIP: 10,
    },
  };

  // Create or update apps
  const apps = [vanMenhApp, thuPhapApp];

  for (const app of apps) {
    try {
      const existing = await prisma.app.findUnique({
        where: { slug: app.slug },
      });

      if (existing) {
        await prisma.app.update({
          where: { slug: app.slug },
          data: app,
        });
        console.log(`✅ Updated: ${app.name} (${app.slug})`);
      } else {
        await prisma.app.create({
          data: app,
        });
        console.log(`✅ Created: ${app.name} (${app.slug})`);
      }
    } catch (error) {
      console.error(`❌ Error with ${app.slug}:`, error);
    }
  }

  console.log('\n🎉 Seeding complete!');
  console.log(`\n🌐 Visit:`);
  console.log(`   - http://localhost:3456/apps`);
  console.log(`   - http://localhost:3456/apps/van-menh`);
  console.log(`   - http://localhost:3456/apps/thu-phap`);
  console.log(`   - http://localhost:3456/admin/apps\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
