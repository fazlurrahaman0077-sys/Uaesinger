// Client-side unsigned upload to Cloudinary (our account). Returns the CDN url.
// Configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.
export const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function cloudinaryConfigured(): boolean {
  return !!(CLOUDINARY_CLOUD && CLOUDINARY_PRESET);
}

export async function uploadVideoToCloudinary(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (!cloudinaryConfigured()) throw new Error("Video uploads aren't configured yet.");
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/video/upload`;
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", CLOUDINARY_PRESET!);

  // XHR so we can report progress on large videos.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText).secure_url as string);
        } catch {
          reject(new Error("Upload succeeded but the response was unreadable."));
        }
      } else {
        let msg = "Upload failed.";
        try {
          msg = JSON.parse(xhr.responseText).error?.message ?? msg;
        } catch {}
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(form);
  });
}
