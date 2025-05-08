/**
 * api-utils.ts
 * 
 * Utility functions for API communication between frontend and backend
 * with support for external RunPod API deployment.
 */

// RunPod API URL - Production backend endpoint
const RUNPOD_API_URL = 'https://api.runpod.ai/v2/fk5lwqqdbcmom5';

/**
 * Configuration for API endpoints
 */
export const API_CONFIG = {
  // API version path segment
  version: '/v1',
  // API base path segment
  basePath: '/api',
  
  // Full API path (base + version)
  get fullPath(): string {
    return `${this.basePath}${this.version}`;
  }
};

/**
 * Gets the appropriate URL for an API endpoint
 * Uses RunPod API URL when deployed, falls back to relative URLs for local development
 * 
 * @param endpoint - The API endpoint path
 * @returns The complete URL for the endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  const isLocalDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
  let normalizedEndpoint = endpoint;
  if (!normalizedEndpoint.startsWith('/')) {
    normalizedEndpoint = '/' + normalizedEndpoint;
  }
  if (!isLocalDevelopment) {
    // For production: always use /run for all non-upload endpoints
    if (normalizedEndpoint.startsWith('/api/v1')) {
      normalizedEndpoint = normalizedEndpoint.substring('/api/v1'.length);
      if (!normalizedEndpoint.startsWith('/')) {
        normalizedEndpoint = '/' + normalizedEndpoint;
      }
    }
    // For RunPod serverless, always use the /run endpoint for non-upload
    // All API routing is handled via the input.endpoint in the payload
    // Exception: direct upload endpoints (handled elsewhere)
    return `${RUNPOD_API_URL}/run`;
  } else {
    if (!normalizedEndpoint.startsWith('/api/v1')) {
      normalizedEndpoint = `/api/v1${normalizedEndpoint}`;
    }
    return normalizedEndpoint;
  }
};

/**
 * Creates a test function to verify both the API connection 
 * and specifically the RunPod connection when on production
 */
export const testRunPodConnection = async (): Promise<boolean> => {
  try {
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1';
    let response;
    if (isLocalDevelopment) {
      response = await fetch(`${RUNPOD_API_URL}/health`, { method: 'GET' });
    } else {
      // Use POST to /run with wrapped payload for health check
      response = await fetch(`${RUNPOD_API_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            endpoint: '/health',
            method: 'GET',
            payload: {}
          }
        })
      });
    }
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Checks if the API is accessible and working
 * Useful for debugging API connectivity issues
 * 
 * @returns Promise resolving to a boolean indicating connection success
 */
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1';
    let response;
    if (isLocalDevelopment) {
      response = await fetch(getApiUrl('/status/health'), { method: 'GET' });
    } else {
      // Use POST to /run with wrapped payload for health check
      response = await fetch(`${RUNPOD_API_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            endpoint: '/status/health',
            method: 'GET',
            payload: {}
          }
        })
      });
    }
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Makes an API request with enhanced error handling
 * 
 * @param endpoint - The API endpoint to call
 * @param options - Fetch request options
 * @returns Promise resolving to the request result
 */
export const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ 
  success: boolean; 
  data?: T; 
  error?: string; 
  status?: number 
}> => {
  try {
    // Construct the URL
    const url = getApiUrl(endpoint);
    console.log(`Making API request to: ${url}`);
    
    // Add default headers if not provided
    if (!options.headers) {
      options.headers = {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
    }
    
    // Set Content-Type if not provided and there's a body
    const headers = options.headers as Record<string, string>;
    if (options.body && !headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
      // Check if we should use special fetch for CORS or RunPod
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1';
                             
    let response;
    if (!isLocalDevelopment) {
      // For production, use our CORS-friendly fetch
      const { fetchWithCORS } = await import('./runpodUtils');
      response = await fetchWithCORS(url, options);
    } else {
      // For local development, use regular fetch
      response = await fetch(url, options);
    }
    
    // Handle response
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      let errorData = null;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse JSON, try to get text
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          // If all else fails, use the default error message
        }
      }
      
      console.error('API request failed:', errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        status: response.status
      };
    }
    
    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { success: true, data };
    } else {
      // Handle non-JSON responses (like empty responses)
      return { success: true, data: null as unknown as T };
    }
  } catch (error) {
    console.error('API request error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
};

/**
 * Lip sync API functions
 */
export const lipSync = {
  /**
   * Start a lip sync job
   * @param payload - The lip sync job parameters
   * @returns Promise resolving to the job details
   */
  start: async (payload: any): Promise<any> => {
    const result = await apiRequest('/lip_sync/start', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to start lip sync job');
    }
    
    return result.data;
  },

  /**
   * Preload a lip sync engine
   * @param engine - The engine to preload
   * @returns Promise resolving to the preload result
   */
  preloadEngine: async (engine: string): Promise<any> => {
    try {
      const result = await apiRequest(`/lip_sync/engine/preload?engine=${engine}`, {
        method: 'GET'
      });
      
      if (!result.success) {
        return {
          success: false,
          status: 'error',
          error: result.error || 'Failed to preload engine',
          fallback: true,
          message: 'Using fallback engine'
        };
      }
      
      return {
        success: true,
        status: 'ready',
        message: 'Engine preloaded successfully'
      };
    } catch (error) {
      console.error(`Error preloading engine ${engine}:`, error);
      
      // Return a fallback response so the UI doesn't break
      return {
        success: false,
        status: 'error',
        fallback: true,
        message: 'Using fallback engine due to error'
      };
    }
  },

  /**
   * Update advanced lipsync settings on the backend
   * @param settings - The advanced lipsync settings to update
   * @returns Promise resolving to the backend response
   */
  updateSettings: async (settings: Record<string, any>): Promise<any> => {
    try {
      const result = await apiRequest('/lip_sync/settings', {
        method: 'POST',
        body: JSON.stringify(settings),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!result.success) {
        if (result.status === 405 || result.status === 404) {
          throw new Error('Advanced lipsync settings endpoint is not available (405/404). Please check backend routes.');
        }
        throw new Error(result.error || 'Failed to update lipsync settings');
      }
      return result.data;
    } catch (error) {
      console.error('Error updating advanced lipsync settings:', error);
      throw error;
    }
  }
};

/**
 * Example usage:
 * 
 * // Simple GET request
 * const { success, data, error } = await apiRequest('/users');
 * 
 * // POST request with body
 * const result = await apiRequest('/users', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'John' })
 * });
 */