import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/supabaseStorage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * API Upload ảnh cho AI Prompts
 * POST /api/ai-prompts/upload-image
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const imageUrl = await uploadImage(file, 'prompts');

    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Image uploaded successfully',
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to upload image',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
