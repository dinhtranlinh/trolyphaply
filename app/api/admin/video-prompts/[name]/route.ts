import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { VideoPromptData, VideoPromptDetail, ApiResponse } from '@/types/video-prompt';

const jsonDir = path.join(process.cwd(), 'Prompt', 'Json');

/**
 * GET /api/admin/video-prompts/[name]?segment=Full
 * Read a video prompt (Full or specific segment like P1, P2)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const segment = searchParams.get('segment') || 'Full';
    
    if (!name) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Prompt name required' },
        { status: 400 }
      );
    }
    
    const filename = path.join(jsonDir, `${name}-${segment}.txt`);
    
    if (!fs.existsSync(filename)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    
    const content = fs.readFileSync(filename, 'utf-8');
    
    let json: VideoPromptData;
    try {
      json = JSON.parse(content);
    } catch (err) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid JSON' },
        { status: 500 }
      );
    }
    
    const stats = fs.statSync(filename);
    
    const detail: VideoPromptDetail = {
      name,
      filename: `${name}-${segment}.txt`,
      title: json.common?.project_title || 'Untitled',
      segments: json.segments?.length || 0,
      created: stats.mtimeMs,
      size: stats.size,
      data: json,
      raw: content
    };
    
    return NextResponse.json<ApiResponse<VideoPromptDetail>>({
      success: true,
      data: detail
    });
  } catch (error) {
    console.error('Error reading video prompt:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to read video prompt' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/video-prompts/[name]
 * Update existing video prompt and regenerate segment files
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body = await request.json();
    const { content } = body;
    
    if (!name || !content) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Name and content required' },
        { status: 400 }
      );
    }
    
    // Validate JSON
    let data: VideoPromptData;
    try {
      data = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (err) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid JSON format' },
        { status: 400 }
      );
    }
    
    // Validate structure
    if (!data.common || !data.segments) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'JSON must contain "common" and "segments"' },
        { status: 400 }
      );
    }
    
    const fullFile = path.join(jsonDir, `${name}-Full.txt`);
    if (!fs.existsSync(fullFile)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    // Delete old segment files
    const oldFiles = fs.readdirSync(jsonDir)
      .filter(f => f.startsWith(`${name}-P`) && f.endsWith('.txt'));
    
    oldFiles.forEach(file => {
      fs.unlinkSync(path.join(jsonDir, file));
    });
    
    // Save Full file
    fs.writeFileSync(
      fullFile,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    
    // Generate new segment files
    const segmentCount = data.segments.length;
    for (let i = 0; i < segmentCount; i++) {
      const segmentData = {
        common: data.common,
        segments: [data.segments[i]]
      };
      
      const segmentFile = path.join(jsonDir, `${name}-P${i + 1}.txt`);
      fs.writeFileSync(
        segmentFile,
        JSON.stringify(segmentData, null, 2),
        'utf-8'
      );
    }
    
    return NextResponse.json<ApiResponse<{ files_updated: number }>>({
      success: true,
      message: 'Video prompt updated successfully',
      data: { files_updated: segmentCount + 1 }
    });
  } catch (error) {
    console.error('Error updating video prompt:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to update video prompt' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/video-prompts/[name]
 * Delete video prompt and all its segment files
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    
    if (!name) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Prompt name required' },
        { status: 400 }
      );
    }
    
    const fullFile = path.join(jsonDir, `${name}-Full.txt`);
    if (!fs.existsSync(fullFile)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      );
    }
    
    // Delete Full file
    fs.unlinkSync(fullFile);
    
    // Delete all segment files
    const segmentFiles = fs.readdirSync(jsonDir)
      .filter(f => f.startsWith(`${name}-P`) && f.endsWith('.txt'));
    
    const deletedCount = segmentFiles.length;
    segmentFiles.forEach(file => {
      fs.unlinkSync(path.join(jsonDir, file));
    });
    
    return NextResponse.json<ApiResponse<{ files_deleted: number }>>({
      success: true,
      message: 'Video prompt deleted successfully',
      data: { files_deleted: deletedCount + 1 }
    });
  } catch (error) {
    console.error('Error deleting video prompt:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to delete video prompt' },
      { status: 500 }
    );
  }
}
