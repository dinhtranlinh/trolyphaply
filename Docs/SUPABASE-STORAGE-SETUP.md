# Hướng dẫn cấu hình Supabase Storage cho AI Prompts

## Bước 1: Tạo Storage Bucket

1. Vào Supabase Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage/buckets
2. Click "New bucket"
3. Cấu hình:
   - **Name**: `ai-prompt-images`
   - **Public bucket**: ✅ YES (để hiển thị ảnh công khai)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: image/jpeg, image/png, image/webp, image/jpg

## Bước 2: Thiết lập Storage Policies

Vào tab "Policies" của bucket `ai-prompt-images`, chạy các policy sau:

### Policy 1: Public Read (Cho phép mọi người xem ảnh)

```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'ai-prompt-images');
```

### Policy 2: Authenticated Upload (Cho phép user upload)

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ai-prompt-images');
```

### Policy 3: Authenticated Update (Cho phép user update ảnh của mình)

```sql
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ai-prompt-images');
```

### Policy 4: Authenticated Delete (Cho phép user xóa ảnh của mình)

```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ai-prompt-images');
```

## Bước 3: Test Upload từ API

Sau khi setup xong, test bằng cách:

1. Vào trang `/ai-prompts`
2. Click "Tạo mới"
3. Upload ảnh thử
4. Check Storage bucket để xem file đã lên chưa

## Bước 4: Lấy Public URL

Format URL công khai:

```
https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/ai-prompt-images/FILENAME.jpg
```

## Notes

- **File naming convention**: `{timestamp}-{random}.{ext}` (VD: `1702345678-a1b2c3.jpg`)
- **Max size**: 5MB để tránh tốn storage
- **Auto resize**: Frontend sẽ resize ảnh về max-width 1200px trước khi upload
- **Supported formats**: JPG, PNG, WebP
