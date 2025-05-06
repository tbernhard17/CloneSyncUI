/**
 * Storage configuration file
 * Centralizes all storage-related constants and URLs
 */

// Storage bucket configuration
export const STORAGE_BUCKET_NAME = 'clonesync-457820_cloudbuild';
export const STORAGE_BASE_URL = `https://storage.googleapis.com/${STORAGE_BUCKET_NAME}`;

// Different storage paths for different content types
export const STORAGE_PATHS = {
  UPLOADS: 'uploads',
  MEDIA: 'media',
  VOICES: 'cloned_voices',
  MODELS: 'rvc_models',
  TEMP: 'tmp'
};

// Function to get a storage URL for a specific file path
export const getStorageUrl = (filePath: string): string => {
  // Make sure the path doesn't start with a slash
  const normalizedPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  return `${STORAGE_BASE_URL}/${normalizedPath}`;
};

// Function to get an upload path for a specific content type
export const getUploadPath = (contentType: keyof typeof STORAGE_PATHS, filename: string): string => {
  const path = STORAGE_PATHS[contentType];
  // Make sure the filename doesn't include path separators for security
  const safeFilename = filename.replace(/\\|\//g, '_');
  return `${path}/${safeFilename}`;
};

// Function to determine if a URL is a storage URL
export const isStorageUrl = (url: string): boolean => {
  return url.includes('storage.googleapis.com');
};

// Export default config object for easy importing
export default {
  STORAGE_BUCKET_NAME,
  STORAGE_BASE_URL,
  STORAGE_PATHS,
  getStorageUrl,
  getUploadPath,
  isStorageUrl
}; 