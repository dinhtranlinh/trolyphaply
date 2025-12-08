/**
 * TypeScript types for Video Prompt Manager
 * Matching JSON structure from Prompt/Json/ files
 */

export interface VideoPromptCommon {
  project_title: string;
  language: string;
  video_usage?: string;
  format: {
    aspect_ratio: string;
    resolution: string;
    frame_rate?: number;
  };
  visual_style: {
    overall_look: string;
    aesthetics?: string;
    color_palette: string;
    ui_elements: string;
  };
  characters?: {
    family?: string;
    officials?: string;
    [key: string]: string | undefined;
  };
  audio_style: {
    music: string;
    sound_effects?: string;
    voiceover_note: string;
  };
}

export interface VideoPromptSegment {
  segment_id: string;
  duration_seconds: number;
  voiceover: string;
  scene_description: string;
  data_visualization?: string;
  camera: string;
  onscreen_text?: string;
}

export interface VideoPromptData {
  common: VideoPromptCommon;
  segments: VideoPromptSegment[];
}

export interface VideoPromptListItem {
  name: string;
  filename: string;
  title: string;
  segments: number;
  created: number;
  size: number;
}

export interface VideoPromptDetail extends VideoPromptListItem {
  data: VideoPromptData;
  raw: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
