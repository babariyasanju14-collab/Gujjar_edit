import { formatBytes } from "./format";

export const MAX_FILE_MB = 200;
const EXT = ["mp4", "mov", "webm"];

export function validateVideoFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!EXT.includes(ext)) return "This file type isn't supported. Please choose an MP4, MOV or WebM video.";
  if (file.type && !file.type.startsWith("video/")) return "That doesn't look like a video file.";
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_FILE_MB * 1024 * 1024)
    return `This video is too large (${formatBytes(file.size)}). The maximum is ${MAX_FILE_MB} MB.`;
  return null;
}

export function readVideoMetadata(url: string): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    const fail = () => {
      clearTimeout(timer);
      reject(new Error("Your browser can't play this video. Try an MP4 (H.264) file instead."));
    };
    const timer = setTimeout(fail, 12000);
    v.preload = "metadata";
    v.muted = true;
    v.onloadedmetadata = () => {
      clearTimeout(timer);
      if (!isFinite(v.duration) || v.duration <= 0) return fail();
      resolve({ duration: v.duration, width: v.videoWidth, height: v.videoHeight });
    };
    v.onerror = fail;
    v.src = url;
  });
}
