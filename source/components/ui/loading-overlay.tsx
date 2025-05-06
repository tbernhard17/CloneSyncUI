import React, { useEffect, useState } from 'react';
import { checkAPIConnection } from '../../api';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  showConnectionCheck?: boolean;
  fullscreen?: boolean;
  timeout?: number;
}

/**
 * Enhanced loading overlay component with backend connection checking
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = "Loading...",
  showConnectionCheck = false,
  fullscreen = false,
  timeout = 15000
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(isLoading);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [timeoutReached, setTimeoutReached] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Connection check when component mounts or isLoading changes
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let elapsedTimer: NodeJS.Timeout;
    
    if (isLoading) {
      setIsVisible(true);
      setTimeoutReached(false);
      setElapsedTime(0);
      
      // Only check connection if specified
      if (showConnectionCheck) {
        setConnectionStatus('checking');
        
        // Check backend connectivity
        checkAPIConnection().then(connected => {
          setConnectionStatus(connected ? 'connected' : 'failed');
        }).catch(() => {
          setConnectionStatus('failed');
        });
      }
      
      // Set timeout to show additional help info
      timer = setTimeout(() => {
        setTimeoutReached(true);
      }, timeout);
      
      // Track elapsed time for better feedback
      elapsedTimer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      // Add slight delay when hiding for better UX
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
    
    return () => {
      clearTimeout(timer);
      clearInterval(elapsedTimer);
    };
  }, [isLoading, showConnectionCheck, timeout]);
  
  if (!isVisible) return null;
  
  const containerClasses = `
    fixed 
    ${fullscreen ? 'inset-0 z-50 bg-black/50 backdrop-blur-sm' : 'rounded-lg bg-black/80 p-6 shadow-xl'}
    flex flex-col items-center justify-center
    transition-all duration-300
  `;
  
  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center justify-center space-y-4 p-4 text-white">
        <div className="relative h-12 w-12">
          {/* Spinning loader */}
          <div className="absolute inset-0 h-full w-full animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          
          {/* Status indicator in the center */}
          {showConnectionCheck && (
            <div className={`
              absolute inset-0 flex items-center justify-center text-xs font-semibold
              ${connectionStatus === 'connected' ? 'text-green-400' : 
                connectionStatus === 'failed' ? 'text-red-400' : 'text-gray-300'}
            `}>
              {connectionStatus === 'connected' ? '✓' : 
               connectionStatus === 'failed' ? '✗' : '...'}
            </div>
          )}
        </div>
        
        <p className="text-center text-lg font-semibold">{message}</p>
        
        {/* Show additional info if still loading after timeout */}
        {timeoutReached && (
          <div className="mt-4 max-w-md text-center">
            <p className="text-amber-300">
              This is taking longer than expected ({Math.floor(elapsedTime)}s)
            </p>
            
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 focus:outline-none"
            >
              {showHelp ? 'Hide help' : 'Need help?'}
            </button>
            
            {showHelp && (
              <div className="mt-3 rounded-md bg-gray-800 p-3 text-sm text-gray-300">
                <p className="mb-2">Possible solutions:</p>
                <ul className="list-inside list-disc text-left">
                  <li>Check your internet connection</li>
                  <li>Refresh the page and try again</li>
                  <li>Clear your browser cache</li>
                  {connectionStatus === 'failed' && (
                    <li className="text-red-400">
                      Backend connection failed - the service might be down or experiencing issues
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay; 