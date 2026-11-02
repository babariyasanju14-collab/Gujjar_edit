// API layer. All server calls go through here.
const BASE = import.meta.env.VITE_API_URL ?? ""; // empty = same origin (Vite proxies /api)

export class ApiError extends Error {
  kind: "network" | "server" | "aborted";
  constructor(message: string, kind: "network" | "server" | "aborted") {
    super(message);
    this.kind = kind;
  }
}

export function uploadVideo(
  file: File,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal
): Promise<{ id: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/api/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      let body: any = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* non-JSON response */
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.id) resolve(body);
      else reject(new ApiError(body.error ?? "Upload failed. Please try again.", "server"));
    };
    xhr.onerror = () => reject(new ApiError("Can't reach the server. Check your connection.", "network"));
    xhr.onabort = () => reject(new ApiError("Upload cancelled.", "aborted"));
    signal?.addEventListener("abort", () => xhr.abort());
    const fd = new FormData();
    fd.append("video", file);
    xhr.send(fd);
  });
}

export async function deleteUpload(id: string): Promise<void> {
  try {
    await fetch(`${BASE}/api/upload/${id}`, { method: "DELETE" });
  } catch {
    /* best effort; server also auto-deletes */
  }
}
