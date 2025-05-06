import React, { useState, useRef } from 'react';
import { uploadFile } from '../api';

interface UploadHandlerProps {
  onUploadComplete?: (response: any) => void;
  onUploadError?: (error: string) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  uploadPath?: string;
  buttonText?: string;
  className?: string;
}

/**
 * Enhanced file upload component with signed URL support for direct-to-GCS uploads
 */
const UploadHandler: React.FC<UploadHandlerProps> = ({ 
  onUploadComplete, 
  onUploadError, 
  acceptedFileTypes = "*", 
  maxSizeMB = 4800, // Default to 4.8GB
  uploadPath = '/',
  buttonText = "Upload File",
  className = ""
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Utility function to format file size
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

    // Add notification for large files that will be chunked
    if (selectedFile.size > 50 * 1024 * 1024) {
      console.log(`Large file detected (${formatFileSize(selectedFile.size)}), will use chunked upload.`);
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Use the centralized upload function that handles multiple upload strategies
      const response = await uploadFile(
        selectedFile, 
        (progress: number) => setUploadProgress(progress)
      );
      
      console.log("Upload complete:", response);
      setUploading(false);
      
      if (onUploadComplete) {
        onUploadComplete(response);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error uploading file';
      setError(errorMessage);
      setUploading(false);
      
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`upload-handler ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        style={{ display: 'none' }}
      />
      
      <button 
        onClick={triggerFileInput}
        disabled={uploading}
        className={`upload-button ${uploading ? 'uploading' : ''}`}
        type="button"
      >
        {uploading ? `Uploading... ${uploadProgress}%` : buttonText}
      </button>
      
      {uploading && (
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      
      {error && (
        <div className="upload-error">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default UploadHandler; 