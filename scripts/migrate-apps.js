/**
 * Migrate 2 apps từ FacebookApp: van-menh và tu-vi-chuyen-sau
 * CHỈ migrate app definitions, KHÔNG migrate results
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const apps = [
  {
    slug: 'van-menh',
    name: 'Xem Vận Mệnh 2025',
    description: 'Khám phá vận mệnh của bạn qua Tứ Trụ, Kinh Dịch và Tử Vi với AI',
    category: 'Tu Vi',
    status: 'active',
    type: 'image_canvas',
    input_schema: {
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
    prompt_template: `Bạn là "Thầy Phán AI" hệ tư tưởng Gen Z: Am hiểu Tử Vi, Tứ Trụ nhưng văn phong hiện đại, "xéo xắt" yêu thương, dùng từ ngữ trendy (slang) mà giới trẻ thích nghe.

INPUT DỮ LIỆU:
- Ngày sinh: {{dob}}
- Giới tính: {{gender}}

NHIỆM VỤ: Xem vận mệnh năm 2025 với phong cách Gen Z, tạo sự khác biệt bằng cách chọn ngẫu nhiên 1 trong 4 kịch bản: Tiền Tỉ, Thoát Ế, Thăng Quan, hoặc Quý Nhân.

Output JSON:
{
  "header_address": "Kính gửi Quý [anh/cô] [Can Chi] - [Năm sinh] mệnh [Mệnh]",
  "title": "Danh xưng (VD: Chiến Thần Hốt Bạc)",
  "past_analysis": "Quá khứ (Max 50 từ)",
  "future_prediction": "Tương lai chi tiết (110-130 từ)",
  "lucky_info": "Số may mắn: 79, 68 | Màu: Vàng Kim",
  "daily_quote": "Quote ngắn gọn",
  "share_caption": "Caption để share (30-50 từ)"
}`,
    render_config: {
      canvasWidth: 1080,
      canvasHeight: 1350,
      backgroundFolder: '/backgrounds/tu-vi',
      layout: {
        header: { y: 250, height: 100 },
        title: { y: 350, height: 100 },
        pastAnalysis: { y: 450, height: 200, color: '#9CA3AF' },
        futureAnalysis: { y: 650, height: 400, color: '#FFD700' },
        footer: { y: 1100, height: 250 }
      }
    },
    share_config: {
      title: 'Vận Mệnh Của Tôi - Xem Tử Vi 2025',
      description: 'Khám phá vận mệnh qua Can Chi và Tử Vi với AI',
      hashtags: ['#TửVi2025', '#XemVậnMệnh', '#CanChi']
    },
    limits: {
      model: {
        provider: 'gemini',
        name: 'gemini-2.0-flash-exp',
        temperature: 0.8,
        responseMimeType: 'application/json'
      },
      maxRequestsPerDay: 1000
    }
  },
  {
    slug: 'tu-vi-chuyen-sau',
    name: 'Tử Vi Chuyên Sâu 2026',
    description: 'Xem lá số tử vi chi tiết với cung mệnh, sao chiếu mệnh, vận hạn từng quý và lời khuyên phong thủy',
    category: 'Tu Vi',
    status: 'active',
    type: 'image_canvas',
    input_schema: {
      fields: [
        { name: 'dob', label: 'Ngày sinh', type: 'date', required: true },
        { 
          name: 'birthHour', 
          label: 'Giờ sinh', 
          type: 'select', 
          required: true, 
          options: [
            'Tý (23h-1h)', 'Sửu (1h-3h)', 'Dần (3h-5h)', 'Mão (5h-7h)',
            'Thìn (7h-9h)', 'Tỵ (9h-11h)', 'Ngọ (11h-13h)', 'Mùi (13h-15h)',
            'Thân (15h-17h)', 'Dậu (17h-19h)', 'Tuất (19h-21h)', 'Hợi (21h-23h)',
            'Không rõ'
          ]
        },
        { name: 'gender', label: 'Giới tính', type: 'select', required: true, options: ['Nam', 'Nữ'] }
      ]
    },
    prompt_template: `Bạn là chuyên gia Tử Vi và Phong Thủy 40 năm kinh nghiệm. Phân tích CHI TIẾT:
- Ngày sinh: {{dob}}
- Giờ sinh: {{birthHour}}
- Giới tính: {{gender}}

Phân tích: Cung mệnh, sao chủ, vận hạn 4 quý năm 2026, phong thủy.

Output JSON:
{
  "title": "Mệnh [Cung] - [Sao]",
  "cung_menh": "Tên cung",
  "sao_chu_menh": "Tên sao",
  "tong_quan": "Tổng quan (2-3 câu)",
  "van_han_quy": {
    "quy1": "Quý 1 (2-3 câu)",
    "quy2": "Quý 2 (2-3 câu)",
    "quy3": "Quý 3 (2-3 câu)",
    "quy4": "Quý 4 (2-3 câu)"
  },
  "phong_thuy": {
    "mau_may_man": "Màu sắc",
    "huong_tot": "Hướng tốt",
    "vat_pham": "Vật phẩm"
  },
  "loi_khuyen": "Lời khuyên (2-3 câu)",
  "share_caption": "Caption ngắn gọn"
}`,
    render_config: {
      background: '/backgrounds/tu-vi/bg-1.png',
      width: 1080,
      height: 1920,
      textColor: '#FFFFFF',
      fontSize: 32
    },
    share_config: {
      title: 'Tử Vi Chuyên Sâu 2026',
      description: 'Xem lá số tử vi chi tiết với cung mệnh, sao chiếu, vận hạn 4 quý'
    },
    limits: {
      model: {
        provider: 'gemini',
        name: 'gemini-2.0-flash-exp',
        temperature: 0.7,
        responseMimeType: 'application/json'
      },
      maxRequestsPerDay: 1000
    }
  }
];

async function migrateApps() {
  console.log('🚀 Migrating 2 apps from FacebookApp...\n');

  for (const appData of apps) {
    try {
      console.log(`📦 Processing: ${appData.name}...`);

      // Check if exists
      const { data: existing } = await supabase
        .from('apps')
        .select('id, slug')
        .eq('slug', appData.slug)
        .single();

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from('apps')
          .update(appData)
          .eq('slug', appData.slug)
          .select()
          .single();

        if (error) throw error;
        console.log(`   ✅ Updated: ${data.slug} (ID: ${data.id})`);
      } else {
        // Insert
        const { data, error } = await supabase
          .from('apps')
          .insert(appData)
          .select()
          .single();

        if (error) throw error;
        console.log(`   ✅ Created: ${data.slug} (ID: ${data.id})`);
      }
    } catch (error) {
      console.error(`   ❌ Error migrating ${appData.slug}:`, error.message);
    }
  }

  console.log('\n🎉 Migration completed!');
  console.log('📋 Summary:');
  console.log('   - van-menh: Xem Vận Mệnh 2025 (Gen Z style)');
  console.log('   - tu-vi-chuyen-sau: Tử Vi Chuyên Sâu 2026 (Chi tiết)');
  console.log('\n📝 Next steps:');
  console.log('   1. Copy background images to public/backgrounds/tu-vi/');
  console.log('   2. Test apps at /apps/van-menh and /apps/tu-vi-chuyen-sau');
}

migrateApps();
