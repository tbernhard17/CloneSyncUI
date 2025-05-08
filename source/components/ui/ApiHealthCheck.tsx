import React, { useEffect, useState } from 'react';
import { getApiUrl, checkApiConnection as checkAPIConnection, testRunPodConnection } from '../../utils/apiUtils';

interface ApiHealthCheckProps {
  onStatusChange?: (isConnected: boolean) => void;
  showErrors?: boolean;
  autoRetry?: boolean;
  retryInterval?: number; // in ms
  checkRunPod?: boolean; // Whether to also check RunPod connection
}

/**
 * Component to check API health and provide user feedback on connectivity issues
 */
const ApiHealthCheck: React.FC<ApiHealthCheckProps> = ({
  onStatusChange,
  showErrors = true,
  autoRetry = true,
  retryInterval = 30000, // 30 seconds
  checkRunPod = false
}) => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [runpodStatus, setRunpodStatus] = useState<'checking' | 'connected' | 'failed' | 'not-checked'>('not-checked');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState<boolean>(false);

  // Determine if we're in production environment (Vercel)
  const isProduction = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1';

  const checkApi = async () => {
    setApiStatus('checking');
    try {
      let isConnected = false;
      
      // Standard API connection check
      if (!isProduction || !checkRunPod) {
        isConnected = await checkAPIConnection();
        setApiStatus(isConnected ? 'connected' : 'failed');
      }
      
      // RunPod check (in production or if specifically requested)
      if ((isProduction || checkRunPod) && checkRunPod) {
        setRunpodStatus('checking');
        const runpodConnected = await testRunPodConnection();
        setRunpodStatus(runpodConnected ? 'connected' : 'failed');
        
        // In production, RunPod connection determines the overall status
        if (isProduction) {
          isConnected = runpodConnected;
          setApiStatus(runpodConnected ? 'connected' : 'failed');
        }
      }
      
      setApiStatus(isConnected ? 'connected' : 'failed');
      setLastChecked(new Date());
      
      if (isConnected) {
        setErrorDetails(null);
        setRetryCount(0);
      } else {
        setErrorDetails(`API connection failed. The backend service is not responding.`);
      }
      
      // Notify parent component if callback is provided
      if (onStatusChange) {
        onStatusChange(isConnected);
      }
    } catch (error) {
      setApiStatus('failed');
      setLastChecked(new Date());
      setErrorDetails(error instanceof Error ? error.message : 'Unknown error occurred');
      
      // Notify parent component if callback is provided
      if (onStatusChange) {
        onStatusChange(false);
      }
    }
  };

  // Initial check when component mounts
  useEffect(() => {
    checkApi();
    
    // Set up periodic rechecks if autoRetry is enabled
    let timer: NodeJS.Timeout;
    if (autoRetry) {
      timer = setInterval(() => {
        // Only auto-retry if in failed state
        if (apiStatus === 'failed') {
          setRetryCount(prev => prev + 1);
          checkApi();
        }
      }, retryInterval);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRetry, retryInterval]);

  // Don't render anything if API is connected and not showing errors
  if (apiStatus === 'connected' && !showErrors) {
    return null;
  }

  // Return null when checking and not showing errors
  if (apiStatus === 'checking' && !showErrors) {
    return null;
  }
  if (apiStatus === 'failed' && showErrors) {
    return (
      <div className="fixed bottom-4 right-4 max-w-md bg-red-50 p-4 rounded-lg shadow-lg border border-red-200 z-50 dark:bg-red-900 dark:border-red-800">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">API Connection Failed</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>The application cannot connect to the backend API.</p>
              {isProduction && runpodStatus === 'failed' && (
                <p className="mt-1 font-semibold">RunPod API connection failed. Please make sure your RunPod endpoint is online.</p>
              )}
              {errorDetails && showErrorDetails && (
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto dark:bg-red-800 dark:text-red-200">
                  {errorDetails}
                </pre>
              )}
            </div>
            <div className="mt-3 flex space-x-2">
              <button
                type="button"
                onClick={checkApi}
                className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-800 dark:text-red-200 dark:border-red-700 dark:hover:bg-red-700"
              >
                Retry Now
              </button>
              <button
                type="button"
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                {showErrorDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {retryCount > 0 && `Retry attempts: ${retryCount}`}
              {lastChecked && ` • Last checked: ${lastChecked.toLocaleTimeString()}`}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ApiHealthCheck; 