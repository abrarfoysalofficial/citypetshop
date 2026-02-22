/**
 * Storage adapter – wraps local filesystem storage.
 * For MinIO/S3, install @aws-sdk/client-s3 and update MINIO_* env vars.
 * Currently uses local storage (UPLOAD_DIR env or /var/www/city-plus/uploads).
 */
export {
  uploadFile,
  deleteFile,
  generateUploadKey,
  getUploadPath,
  ensureUploadDir,
  type UploadResult,
} from "./storage-local";
