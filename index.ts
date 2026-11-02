export type FormatId = "9:16" | "16:9" | "1:1";
export type ToolId = "text" | "animation" | "style" | "timing" | "export";

export interface VideoInfo {
  file: File;
  url: string; // object URL for preview
  name: string;
  size: number;
  duration: number;
  width: number;
  height: number;
}

export interface Session {
  video: VideoInfo;
  uploadId: string | null; // null = preview-only (server not used)
}
