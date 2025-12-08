// Supabase Storage helpers
import { supabase } from './supabase';

export async function uploadImage(
  bucket: string,
  path: string,
  file: Buffer | File,
  contentType: string = 'image/png'
): Promise<{ url: string; path: string }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    url: publicUrl,
    path: data.path,
  };
}

export async function deleteImage(
  bucket: string,
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

export async function getPublicUrl(bucket: string, path: string): Promise<string> {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}

export async function createBucket(
  bucketName: string,
  isPublic: boolean = true
): Promise<void> {
  const { error } = await supabase.storage.createBucket(bucketName, {
    public: isPublic,
  });

  if (error && !error.message.includes('already exists')) {
    throw new Error(`Failed to create bucket: ${error.message}`);
  }
}
