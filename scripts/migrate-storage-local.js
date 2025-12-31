const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  return dotenv.parse(content);
}

function getEnvValue(env, keys) {
  for (const key of keys) {
    if (env[key]) return env[key];
  }
  return null;
}

async function listAllObjects(client, bucket, prefix = '') {
  const files = [];
  const { data, error } = await client.storage.from(bucket).list(prefix, {
    limit: 1000,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) throw error;
  for (const item of data || []) {
    const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) {
      files.push(itemPath);
    } else {
      const nested = await listAllObjects(client, bucket, itemPath);
      files.push(...nested);
    }
  }
  return files;
}

async function downloadToBuffer(storage, bucket, filePath) {
  const { data, error } = await storage.from(bucket).download(filePath);
  if (error) throw error;
  const arrayBuffer = await data.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType: data.type || 'application/octet-stream' };
}

async function ensureBucket(client, bucket, isPublic) {
  const { data, error } = await client.storage.listBuckets();
  if (error) throw error;
  const exists = (data || []).some((b) => b.name === bucket);
  if (!exists) {
    const { error: createError } = await client.storage.createBucket(bucket, {
      public: !!isPublic,
    });
    if (createError) throw createError;
  }
}

async function main() {
  const root = process.cwd();
  const cloudEnv = loadEnv(path.join(root, '.env'));
  const localEnv = loadEnv(path.join(root, '.env.local'));

  const cloudUrl = getEnvValue(cloudEnv, ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL']);
  const cloudKey = getEnvValue(cloudEnv, ['SUPABASE_SERVICE_ROLE_KEY']);
  const localUrl = getEnvValue(localEnv, ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL']);
  const localKey = getEnvValue(localEnv, ['SUPABASE_SERVICE_ROLE_KEY']);

  if (!cloudUrl || !cloudKey) throw new Error('Missing cloud SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  if (!localUrl || !localKey) throw new Error('Missing local SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');

  const cloud = createClient(cloudUrl, cloudKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const local = createClient(localUrl, localKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: buckets, error: bucketsError } = await cloud.storage.listBuckets();
  if (bucketsError) throw bucketsError;

  for (const bucket of buckets || []) {
    await ensureBucket(local, bucket.name, bucket.public);
    const files = await listAllObjects(cloud, bucket.name);
    for (const filePath of files) {
      const { buffer, contentType } = await downloadToBuffer(cloud.storage, bucket.name, filePath);
      const { error: uploadError } = await local.storage.from(bucket.name).upload(filePath, buffer, {
        contentType,
        upsert: true,
      });
      if (uploadError) throw uploadError;
    }
  }

  console.log('Storage migration completed.');
}

main().catch((err) => {
  console.error('Storage migration failed:', err);
  process.exit(1);
});
