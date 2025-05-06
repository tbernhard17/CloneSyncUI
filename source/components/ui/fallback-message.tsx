import React from 'react';

// Define isCloudStorage locally since it does not exist in shared utils
const isCloudStorage = typeof window !== 'undefined' &&
  (window.location.hostname.endsWith('.storage.googleapis.com') ||
   window.location.hostname.endsWith('.googleusercontent.com'));

interface FallbackMessageProps {
  title?: string;
  message?: string;
  showApiInfo?: boolean;
}

export const FallbackMessage: React.FC<FallbackMessageProps> = ({
  title = "Running in Viewer Mode",
  message = "Some features may be limited when viewing from Google Cloud Storage.",
  showApiInfo = true
}) => {
  // Only show this message when running from Cloud Storage
  if (!isCloudStorage) return null;
  
  return (
    <div className="w-full p-4 mb-4 border border-yellow-200 rounded-md bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
      <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
        {title}
      </h3>
      <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
        {message}
      </p>
      {showApiInfo && (
        <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
          To enable full functionality, please run the application locally or deploy with proper API access.
        </p>
      )}
    </div>
  );
};

export default FallbackMessage; 