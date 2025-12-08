// Migrate apps from FacebookApp
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateApps() {
  console.log('🚀 Migrating apps from FacebookApp...\n');

  const apps = [
    {
      slug: 'van-menh',
      name: 'Vận Mệnh Của Bạn',
      description: 'Tạo chữ thư pháp vận mệnh từ tên của bạn với AI',
      category: 'Tử vi',
      status: 'published',
      type: 'image_canvas',
      input_schema: {
        fields: [
          {
            id: 'names',
            label: 'Tên các thành viên gia đình (mỗi tên một dòng)',
            type: 'textarea',
            placeholder: 'Nguyễn Văn A\nNguyễn Thị B\n...',
            required: true,
            rows: 5,
          },
          {
            id: 'style',
            label: 'Phong cách chữ',
            type: 'select',
            options: [
              { value: 'co-dien', label: 'Cổ điển' },
              { value: 'hien-dai', label: 'Hiện đại' },
              { value: 'trang-nha', label: 'Trang nhã' },
            ],
            required: true,
            default: 'co-dien',
          },
        ],
      },
      prompt_template: `Bạn là thầy thư pháp chuyên nghiệp và chuyên gia tử vi.

Hãy tạo chữ thư pháp vận mệnh cho các tên sau (mỗi tên một chữ):
{{names}}

Phong cách: {{style}}

Yêu cầu:
1. Mỗi tên tạo 1 chữ thư pháp ngắn gọn (2-4 chữ)
2. Chữ thư pháp phải có ý nghĩa tốt đẹp, mang lại may mắn
3. Giải thích ý nghĩa của chữ đó
4. Phù hợp với phong cách được chọn

Trả về JSON với format:
{
  "characters": [
    {
      "name": "Tên người",
      "calligraphy": "Chữ thư pháp",
      "meaning": "Ý nghĩa",
      "fortune": "Lời chúc phúc"
    }
  ]
}`,
      output_schema: {
        type: 'json',
        structure: {
          characters: 'array',
        },
      },
      render_config: {
        type: 'canvas',
        width: 1080,
        height: 1920,
        background: {
          type: 'image',
          path: '/backgrounds/van-menh.jpg',
        },
        texts: [
          {
            field: 'calligraphy',
            x: 540,
            y: 800,
            fontSize: 120,
            fontWeight: 'bold',
            color: '#D4AF37',
            fontFamily: 'serif',
            textAlign: 'middle',
          },
          {
            field: 'meaning',
            x: 540,
            y: 1000,
            fontSize: 36,
            color: '#FFFFFF',
            textAlign: 'middle',
            maxWidth: 900,
          },
        ],
      },
      share_config: {
        title: 'Vận Mệnh Của {{name}}',
        description: '{{calligraphy}} - {{meaning}}',
        hashtags: ['VậnMệnh', 'ThưPhápAI', 'TửVi'],
      },
      limits: {
        maxNamesPerSubmit: 5,
        cooldownMinutes: 0,
      },
    },
    {
      slug: 'tu-vi-chuyen-sau',
      name: 'Tử Vi Chuyên Sâu',
      description: 'Xem tử vi chi tiết theo năm sinh và ngày sinh với AI',
      category: 'Tử vi',
      status: 'published',
      type: 'text_only',
      input_schema: {
        fields: [
          {
            id: 'name',
            label: 'Tên của bạn',
            type: 'text',
            placeholder: 'Nguyễn Văn A',
            required: true,
          },
          {
            id: 'birthDate',
            label: 'Ngày sinh (Dương lịch)',
            type: 'date',
            required: true,
          },
          {
            id: 'birthTime',
            label: 'Giờ sinh (tùy chọn)',
            type: 'time',
            required: false,
          },
          {
            id: 'gender',
            label: 'Giới tính',
            type: 'select',
            options: [
              { value: 'male', label: 'Nam' },
              { value: 'female', label: 'Nữ' },
            ],
            required: true,
          },
          {
            id: 'question',
            label: 'Bạn muốn hỏi về điều gì? (tùy chọn)',
            type: 'textarea',
            placeholder: 'Vd: Sự nghiệp, tình duyên, tài lộc...',
            required: false,
            rows: 3,
          },
        ],
      },
      prompt_template: `Bạn là chuyên gia tử vi có 30 năm kinh nghiệm.

Thông tin:
- Tên: {{name}}
- Ngày sinh: {{birthDate}}
- Giờ sinh: {{birthTime}}
- Giới tính: {{gender}}
- Câu hỏi: {{question}}

Hãy xem tử vi chi tiết cho người này, bao gồm:

1. **Tổng quan vận mệnh**
   - Ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ)
   - Mệnh gì (Hải Trung Kim, Sơn Đầu Hỏa...)
   - Đặc điểm tính cách chính

2. **Vận năm nay (2025)**
   - Vận may chung
   - Sự nghiệp
   - Tài lộc
   - Tình cảm
   - Sức khỏe

3. **Lời khuyên**
   - Điều nên làm
   - Điều nên tránh
   - Hướng tốt, màu sắc, số may mắn

4. **Trả lời câu hỏi** (nếu có)

Viết theo phong cách chuyên nghiệp nhưng dễ hiểu, tích cực, đầy động viên.`,
      output_schema: {
        type: 'text',
      },
      render_config: null,
      share_config: {
        title: 'Tử Vi {{name}}',
        description: 'Xem tử vi chuyên sâu với AI',
        hashtags: ['TửVi', 'VậnMệnh', 'TửViChuyênSâu'],
      },
      limits: {
        maxSubmitsPerDay: 10,
        cooldownMinutes: 5,
      },
    },
  ];

  console.log('📝 Inserting app definitions...\n');

  for (const app of apps) {
    const { data, error } = await supabase
      .from('apps')
      .insert(app)
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Error migrating ${app.name}:`, error.message);
    } else {
      console.log(`  ✅ ${app.name} (/${app.slug})`);
    }
  }

  console.log('\n✨ App migration completed!');
  console.log('\n📊 Note: Background images need to be added manually to public/backgrounds/');
  console.log('  - van-menh.jpg (for Vận Mệnh Của Bạn)');
}

migrateApps().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
