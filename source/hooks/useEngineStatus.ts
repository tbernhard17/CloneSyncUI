import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';

interface EngineStatus {
  loaded: boolean;
  status: string;
  progress: number;
  error: string | null;
  is_current: boolean;
  engine: string;
}

interface StartupStatus {
  system_ready: boolean;
  uptime_seconds: number | null;
  default_engine: string;
  default_engine_loaded: boolean;
  default_engine_status: {
    status: string;
    progress: number;
    error: string | null;
  };
  lazy_loading_enabled: boolean;
}

/**
 * Hook for monitoring the status of a lip sync engine.
 * Polls the API to check if the engine is loaded and ready.
 * 
 * @param engine The engine name to monitor (wav2lip, sadtalker, geneface)
 * @param pollInterval Polling interval in milliseconds (default: 2000)
 * @param maxRetries Maximum number of retries (default: 30, set to 0 for infinite)
 * @returns Engine status information
 */
export function useEngineStatus(
  engine: string,
  pollInterval = 2000,
  maxRetries = 30
) {
  const [status, setStatus] = useState<EngineStatus>({
    loaded: false,
    status: 'unknown',
    progress: 0,
    error: null,
    is_current: false,
    engine
  });
  const [retries, setRetries] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/lip_sync/engine/status?engine=${engine}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch engine status: ${response.status}`);
      }
      
      const data = await response.json();
      setStatus(data);
      
    } catch (error) {
      console.error('Error fetching engine status:', error);
      setRetries(r => r + 1);
    }
  }, [engine]);

  useEffect(() => {
    // If already loaded, no need to poll
    if (status.loaded) return;
    
    // If reached max retries, stop polling
    if (maxRetries > 0 && retries >= maxRetries) return;
    
    // Start polling
    const interval = setInterval(fetchStatus, pollInterval);
    
    // Initial fetch
    fetchStatus();
    
    return () => clearInterval(interval);
  }, [fetchStatus, status.loaded, retries, maxRetries, pollInterval]);

  return status;
}

/**
 * Hook for monitoring overall system startup status
 * Useful for checking if the system is ready before allowing user interactions
 * 
 * @param pollInterval Polling interval in milliseconds (default: 2000)
 * @param maxRetries Maximum number of retries (default: 30, set to 0 for infinite)
 * @returns System startup status information
 */
export function useStartupStatus(
  pollInterval = 2000,
  maxRetries = 30
) {
  const [status, setStatus] = useState<StartupStatus | null>(null);
  const [retries, setRetries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/lip_sync/startup-status`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch startup status: ${response.status}`);
      }
      
      const data = await response.json();
      setStatus(data);
      setError(null);
      
      // If system is ready, stop polling
      if (data.system_ready) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error fetching startup status:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setRetries(r => r + 1);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If system is ready or max retries reached, stop polling
    if (status?.system_ready || (maxRetries > 0 && retries >= maxRetries)) {
      return;
    }
    
    // Start polling
    const interval = setInterval(async () => {
      const isReady = await fetchStatus();
      if (isReady) {
        clearInterval(interval);
      }
    }, pollInterval);
    
    // Initial fetch
    fetchStatus();
    
    return () => clearInterval(interval);
  }, [fetchStatus, status?.system_ready, retries, maxRetries, pollInterval]);

  return {
    status,
    loading,
    error,
    isReady: status?.system_ready || false
  };
} 