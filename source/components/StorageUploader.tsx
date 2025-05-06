import React, { useState, useRef } from 'react';
import { uploadFile } from '../utils/api';
import { STORAGE_BASE_URL, STORAGE_PATHS, getUploadPath } from '../config/storage';

interface StorageUploaderProps {
  /**
   * The type of content being uploaded (uses storage paths from config)
   */
  contentType: keyof typeof STORAGE_PATHS;
  
  /**
   * Callback triggered when upload is complete
   */
  onUploadComplete?: (response: any) => void;
  
  /**
   * Callback for upload errors
   */
  onUploadError?: (error: string) => void;
  
  /**
   * Allowed file types (MIME types or extensions)
   */
  acceptedFileTypes?: string;
  
  /**
   * Maximum file size in MB
   */
  maxSizeMB?: number;
  
  /**
   * Text for the upload button
   */
  buttonText?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether to use direct storage upload
   */
  useDirectStorage?: boolean;
}

/**
 * StorageUploader - Component for uploading files to Google Cloud Storage
 * 
 * This component handles both backend-proxied uploads and direct-to-storage uploads
 */
const StorageUploader: React.FC<StorageUploaderProps> = ({
  contentType,
  onUploadComplete,
  onUploadError,
  acceptedFileTypes = '*',
  maxSizeMB = 500,
  buttonText = 'Upload File',
  className = '',
  useDirectStorage = true
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size before starting upload
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      const errorMessage = `File too large (${formatFileSize(selectedFile.size)}). Maximum allowed size is ${maxSizeMB} MB.`;
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setSuccess(false);

    try {
      // Generate the correct storage path for this content type
      const storagePath = getUploadPath(contentType, selectedFile.name);
      console.log(`Uploading ${selectedFile.name} to ${storagePath}`);
      
      // If using direct storage upload, provide the URL directly
      const uploadUrl = useDirectStorage 
        ? `${STORAGE_BASE_URL}/${storagePath}`
        : undefined; // Let the API handle it

      // Upload the file
      const response = await uploadFile(
        selectedFile,
        (progress) => setUploadProgress(progress)
      );

      setSuccess(true);
      setUploading(false);
      
      // Call the onUploadComplete callback with the response
      if (onUploadComplete) onUploadComplete(response);
      
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploading(false);
      const errorMsg = err instanceof Error ? err.message : 'Unknown upload error';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className={`storage-uploader ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden"
        disabled={uploading}
      />
      
      <button
        onClick={triggerFileSelect}
        disabled={uploading}
        className={`px-4 py-2 rounded-md font-medium ${
          uploading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {buttonText}
      </button>

      {uploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Uploading: {uploadProgress}%
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-500 mt-2">
          Upload complete!
        </p>
      )}
    </div>
  );
};

export default StorageUploader; 