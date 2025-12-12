import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Admin client với service role key để bypass RLS
// Fallback to anon key if service key not available (for client-side)
const supabaseKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

/**
 * Upload ảnh lên Supabase Storage
 * @param file - File object từ form upload
 * @param folder - Thư mục trong bucket (mặc định: 'prompts')
 * @returns Public URL của ảnh đã upload
 */
export async function uploadImage(file: File, folder: string = 'prompts'): Promise<string> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG, WebP are allowed.');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('ai-prompt-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('ai-prompt-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('Upload image error:', error);
    throw error;
  }
}

/**
 * Xóa ảnh từ Supabase Storage
 * @param imageUrl - URL đầy đủ của ảnh cần xóa
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/ai-prompt-images/prompts/xxx.jpg
    const urlParts = imageUrl.split('/ai-prompt-images/');
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL format');
    }
    
    const filePath = urlParts[1];

    const { error } = await supabaseAdmin.storage
      .from('ai-prompt-images')
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Delete image error:', error);
    throw error;
  }
}
