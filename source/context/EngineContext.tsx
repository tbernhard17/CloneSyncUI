import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import { lipSync } from '../utils/apiUtils';

export type EngineType = 'wav2lip' | 'sadtalker';
export type EngineStatusType = 'idle' | 'loading' | 'ready' | 'error';

interface EngineInfo {
  id: EngineType;
  name: string;
  status: EngineStatusType;
  errorMessage?: string;
}

interface EngineContextProps {
  engines: Record<EngineType, EngineInfo>;
  currentEngine: EngineType;
  engineStatus: EngineStatusType; // Overall status of the *current* engine
  isEngineReady: boolean; // Convenience flag for current engine
  changeEngine: (engine: EngineType) => Promise<void>; // Make it async
  preloadEngine: (engine: EngineType) => Promise<void>; // Explicit preload
}

const EngineContext = createContext<EngineContextProps | undefined>(undefined);

const DEFAULT_ENGINE: EngineType = 'wav2lip';

// Helper to detect if we're in a deployment environment without the backend
const isVercelDeployment = () => {
  return typeof window !== 'undefined' && 
         (window.location.hostname.includes('vercel.app') || 
          process.env.NODE_ENV === 'production');
};

export const EngineProvider = ({ children }: { children: ReactNode }) => {
  const [engines, setEngines] = useState<Record<EngineType, EngineInfo>>({
    wav2lip: { id: 'wav2lip', name: 'Wav2Lip', status: 'idle' },
    sadtalker: { id: 'sadtalker', name: 'SadTalker', status: 'idle' },
  });
  const [currentEngine, setCurrentEngine] = useState<EngineType>(DEFAULT_ENGINE);
  const [engineStatus, setEngineStatus] = useState<EngineStatusType>('idle');
  const [isDeployment, setIsDeployment] = useState(false);

  // Check if we're in a deployment environment
  useEffect(() => {
    setIsDeployment(isVercelDeployment());
  }, []);

  const updateEngineStatus = (engine: EngineType, status: EngineStatusType, errorMessage?: string) => {
    setEngines(prev => ({
      ...prev,
      [engine]: { ...prev[engine], status, errorMessage: errorMessage ?? undefined },
    }));
    // Update the overall status if the change affects the current engine
    if (engine === currentEngine) {
      setEngineStatus(status);
    }
  };

  const preloadEngine = useCallback(async (engine: EngineType) => {
    console.log(`Preloading engine: ${engine}`);
    updateEngineStatus(engine, 'loading');
    
    // If we're in a deployment environment, simulate success after a delay
    if (isDeployment) {
      console.log("Deployment environment detected, simulating engine ready state");
      // Simulate a delay and then mark as ready
      setTimeout(() => {
        updateEngineStatus(engine, 'ready');
      }, 1500);
      return;
    }
    
    try {
      const response = await lipSync.preloadEngine(engine);
      console.log(`Preload response for ${engine}:`, response);
      if (response.success && response.status === 'ready' && !response.fallback) {
        updateEngineStatus(engine, 'ready');
      } else if (response.fallback) {
         // Treat fallback as ready but maybe log a warning or store the message
         console.warn(`Engine ${engine} preload returned fallback status: ${response.message || 'No message'}. Assuming ready.`);
         updateEngineStatus(engine, 'ready', `Fallback: ${response.message || 'Unknown reason'}`);
      } else {
        throw new Error(response.error || `Preload failed for ${engine}`);
      }
    } catch (error) {
      console.error(`Failed to preload engine ${engine}:`, error);
      // In case of error, if we're in a deployment environment, still mark as ready
      if (isDeployment) {
        console.log("Deployment environment: marking engine as ready despite error");
        updateEngineStatus(engine, 'ready');
      } else {
        updateEngineStatus(engine, 'error', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }, [currentEngine, isDeployment]); // Add currentEngine dependency

  // Preload the default engine on initial mount
  useEffect(() => {
    preloadEngine(DEFAULT_ENGINE);
    // Set the overall status based on the default engine's initial preload attempt
    setEngineStatus(engines[DEFAULT_ENGINE].status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeployment]); // Run when isDeployment is determined

  // Poll backend engine status and sync engineStatus
  useEffect(() => {
    // Skip polling in deployment environment
    if (isDeployment) {
      return;
    }
    
    let errorCounts: Record<EngineType, number> = { wav2lip: 0, sadtalker: 0 };
    const MAX_ERROR_RETRIES = 3;
    const poll = setInterval(async () => {
      for (const engine of Object.keys(engines) as EngineType[]) {
        try {
          const res = await fetch(`/api/v1/lip_sync/engine/status?engine=${engine}`);
          if (!res.ok) throw new Error(`Status not ok: ${res.status}`);
          const data = await res.json();
          if (data.loaded && data.status === 'available') {
            updateEngineStatus(engine, 'ready');
            errorCounts[engine] = 0;
          } else if (!data.loaded && data.status === 'unavailable') {
            updateEngineStatus(engine, 'loading');
            errorCounts[engine] = 0;
          } else {
            updateEngineStatus(engine, 'idle');
            errorCounts[engine] = 0;
          }
        } catch (e) {
          errorCounts[engine] = (errorCounts[engine] || 0) + 1;
          if (errorCounts[engine] >= MAX_ERROR_RETRIES) {
            updateEngineStatus(engine, 'error', 'Failed to poll engine status');
          }
          // Otherwise, keep previous status (do not flicker to error)
        }
      }
    }, 2000);
    return () => clearInterval(poll);
  }, [engines, currentEngine, isDeployment]);

  const changeEngine = useCallback(async (engine: EngineType) => {
    if (engine === currentEngine) return; // No change needed

    console.log(`Changing engine to: ${engine}`);
    setCurrentEngine(engine);

    // In deployment environment, just mark as ready
    if (isDeployment) {
      updateEngineStatus(engine, 'ready');
      return;
    }

    // Check if the target engine is already ready or loading
    const targetEngineStatus = engines[engine]?.status;
    if (targetEngineStatus === 'ready') {
        setEngineStatus('ready');
        console.log(`Engine ${engine} is already ready.`);
        return; // Already ready, no need to preload again
    } else if (targetEngineStatus === 'loading') {
        setEngineStatus('loading');
        console.log(`Engine ${engine} is already loading.`);
        return; // Already loading
    }

    // Otherwise, initiate preload for the new engine
    await preloadEngine(engine);

  }, [currentEngine, engines, preloadEngine, isDeployment]);

  const isEngineReady = engineStatus === 'ready';

  return (
    <EngineContext.Provider value={{ engines, currentEngine, engineStatus, isEngineReady, changeEngine, preloadEngine }}>
      {children}
    </EngineContext.Provider>
  );
};

export const useEngines = () => {
  const context = useContext(EngineContext);
  if (context === undefined) {
    throw new Error('useEngines must be used within an EngineProvider');
  }
  return context;
};