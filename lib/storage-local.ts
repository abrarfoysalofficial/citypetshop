/**
 * Local filesystem storage for self-hosted deployments.
 * No S3, MinIO, or Supabase. Uses UPLOAD_DIR env.
 */
import { promises as fs } from "fs";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "/var/www/city-plus/uploads";
const APP_URL = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "";

export interface UploadResult {
  bucket: string;
  key: string;
  url: string;
  size: number;
  mimeType: string;
}

/** Ensure upload directory exists and is writable. */
export async function ensureUploadDir(subdir = ""): Promise<string> {
  const dir = path.join(UPLOAD_DIR, subdir);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/** Upload file to local storage. Returns public URL. */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  mimeType: string,
  _bucket = "store-assets"
): Promise<UploadResult> {
  const fullPath = path.join(UPLOAD_DIR, key);
  const dir = path.dirname(fullPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(fullPath, body);

  const url = `${APP_URL}/api/media/${encodeURIComponent(key)}`;
  return {
    bucket: "local",
    key,
    url,
    size: body.length,
    mimeType,
  };
}

/** Delete file from local storage. */
export async function deleteFile(key: string, _bucket = "store-assets"): Promise<void> {
  const fullPath = path.join(UPLOAD_DIR, key);
  try {
    await fs.unlink(fullPath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}

/** Generate unique key for upload. */
export function generateUploadKey(prefix: string, filename: string): string {
  const ext = filename.split(".").pop() ?? "bin";
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}/${timestamp}-${random}.${ext}`;
}

/** Get absolute path for a key (for serving). */
export function getUploadPath(key: string): string {
  return path.join(UPLOAD_DIR, key);
}
