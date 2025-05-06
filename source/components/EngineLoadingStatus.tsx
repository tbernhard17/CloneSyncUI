import React from 'react';
import { useEngineStatus, useStartupStatus } from '../hooks/useEngineStatus';
import { Progress } from './ui/progress';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';

interface EngineLoadingStatusProps {
  engine?: string;  // If not provided, shows system status
  onReady?: () => void;  // Called when the engine is ready
}

/**
 * Component to display the loading status of a lip sync engine
 * or the overall system status
 */
const EngineLoadingStatus: React.FC<EngineLoadingStatusProps> = ({ 
  engine, 
  onReady 
}) => {
  // If engine is provided, monitor that specific engine
  // Otherwise monitor overall system status
  const engineStatus = engine ? useEngineStatus(engine) : null;
  const { status: startupStatus, isReady, loading } = useStartupStatus();
  
  // Call onReady when status changes to loaded/ready
  React.useEffect(() => {
    if (onReady) {
      if (engine && engineStatus?.loaded) {
        onReady();
      } else if (!engine && isReady) {
        onReady();
      }
    }
  }, [engine, engineStatus?.loaded, isReady, onReady]);
  
  if (loading && !startupStatus) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-700">Checking system status...</span>
      </div>
    );
  }
  
  // If monitoring a specific engine
  if (engine && engineStatus) {
    // If engine is loaded, return nothing or a success message
    if (engineStatus.loaded) {
      return (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <AlertTitle>Engine Ready</AlertTitle>
          <AlertDescription>
            {engine} engine is loaded and ready to use.
          </AlertDescription>
        </Alert>
      );
    }
    
    // If engine is loading, show progress
    if (engineStatus.status === 'loading') {
      return (
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Loading {engine} engine...</span>
            <span className="text-sm font-medium">{engineStatus.progress}%</span>
          </div>
          <Progress value={engineStatus.progress} className="w-full" />
        </div>
      );
    }
    
    // If there was an error loading the engine
    if (engineStatus.error) {
      return (
        <Alert className="bg-red-50 border-red-200 mb-4">
          <AlertTitle>Error Loading Engine</AlertTitle>
          <AlertDescription>
            {engineStatus.error}
          </AlertDescription>
        </Alert>
      );
    }
    
    // Waiting to start or unknown status
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-700">Preparing {engine} engine...</span>
      </div>
    );
  }
  
  // Show overall system status
  if (startupStatus) {
    const { 
      system_ready, 
      default_engine, 
      default_engine_loaded, 
      default_engine_status,
      lazy_loading_enabled 
    } = startupStatus;
    
    if (system_ready) {
      return (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <AlertTitle>System Ready</AlertTitle>
          <AlertDescription>
            {lazy_loading_enabled 
              ? "System is ready with lazy loading enabled. Models will be loaded on demand."
              : `System is ready with ${default_engine} engine loaded.`
            }
          </AlertDescription>
        </Alert>
      );
    }
    
    // If waiting for default engine to load
    if (!default_engine_loaded && !lazy_loading_enabled) {
      return (
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Loading default engine ({default_engine})...
            </span>
            <span className="text-sm font-medium">
              {default_engine_status.progress}%
            </span>
          </div>
          <Progress 
            value={default_engine_status.progress} 
            className="w-full" 
          />
        </div>
      );
    }
  }
  
  // Fallback for other cases
  return null;
};

export default EngineLoadingStatus; 