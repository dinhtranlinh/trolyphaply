import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { VideoPromptData, VideoPromptListItem, ApiResponse } from '@/types/video-prompt';

const jsonDir = path.join(process.cwd(), 'Prompt', 'Json');

// Ensure Json directory exists
function ensureJsonDir() {
  if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir, { recursive: true });
  }
}

/**
 * GET /api/admin/video-prompts
 * List all video prompts (only -Full.txt files)
 */
export async function GET() {
  try {
    ensureJsonDir();
    
    const files = fs.readdirSync(jsonDir)
      .filter(f => f.endsWith('-Full.txt'));
    
    const prompts: VideoPromptListItem[] = files.map(file => {
      const filePath = path.join(jsonDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      try {
        const json: VideoPromptData = JSON.parse(content);
        const stats = fs.statSync(filePath);
        
        return {
          name: file.replace('-Full.txt', ''),
          filename: file,
          title: json.common?.project_title || 'Untitled',
          segments: json.segments?.length || 0,
          created: stats.mtimeMs,
          size: stats.size
        };
      } catch (err) {
        console.error(`Error parsing ${file}:`, err);
        return null;
      }
    }).filter(Boolean) as VideoPromptListItem[];
    
    // Sort by created date (newest first)
    prompts.sort((a, b) => b.created - a.created);
    
    return NextResponse.json<ApiResponse<VideoPromptListItem[]>>({
      success: true,
      data: prompts
    });
  } catch (error) {
    console.error('Error listing video prompts:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to list video prompts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/video-prompts
 * Create new video prompt and generate segment files
 */
export async function POST(request: NextRequest) {
  try {
    ensureJsonDir();
    
    const body = await request.json();
    const { name, content } = body;
    
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
    
    if (!Array.isArray(data.segments) || data.segments.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Segments must be a non-empty array' },
        { status: 400 }
      );
    }
    
    // Check if already exists
    const fullFile = path.join(jsonDir, `${name}-Full.txt`);
    if (fs.existsSync(fullFile)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Prompt already exists' },
        { status: 409 }
      );
    }
    
    // Save Full file
    fs.writeFileSync(
      fullFile,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    
    // Generate segment files
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
    
    return NextResponse.json<ApiResponse<{ files_created: number }>>({
      success: true,
      message: 'Video prompt created successfully',
      data: { files_created: segmentCount + 1 }
    });
  } catch (error) {
    console.error('Error creating video prompt:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Failed to create video prompt' },
      { status: 500 }
    );
  }
}
