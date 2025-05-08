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
  // Use environment-specific URL construction
  const isLocalDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
  
  // Normalize the endpoint
  let normalizedEndpoint = endpoint;
  
  // Ensure endpoint has leading slash
  if (!normalizedEndpoint.startsWith('/')) {
    normalizedEndpoint = '/' + normalizedEndpoint;
  }
  
  if (!isLocalDevelopment) {
    // For production: use RunPod API URL with specific path handling
    // If the path has /api/v1, remove it to avoid double-prefixing
    if (normalizedEndpoint.startsWith('/api/v1')) {
      normalizedEndpoint = normalizedEndpoint.substring('/api/v1'.length);
      // Make sure it still has a leading slash after removing prefix
      if (!normalizedEndpoint.startsWith('/')) {
        normalizedEndpoint = '/' + normalizedEndpoint;
      }
    }
    
    // Special case handling for file uploads and other direct paths
    const isFileUpload = normalizedEndpoint.includes('/upload/');
    const isLipSyncEngine = normalizedEndpoint.includes('/lip_sync/engine/');
    
    // For file uploads, don't use the /run endpoint
    if (isFileUpload) {
      console.log(`Using RunPod file upload API: ${RUNPOD_API_URL}${normalizedEndpoint}`);
      return `${RUNPOD_API_URL}${normalizedEndpoint}`;
    } 
    // For lip sync engine endpoints, use direct path
    else if (isLipSyncEngine) {
      console.log(`Using RunPod lip sync engine API: ${RUNPOD_API_URL}${normalizedEndpoint}`);
      return `${RUNPOD_API_URL}${normalizedEndpoint}`;
    } 
    // For most other endpoints, use the RunPod handler pattern
    else {
      // Use input/endpoint pattern required by RunPod handler
      const handlerEndpoint = `/run`;
      console.log(`Using RunPod handler API: ${RUNPOD_API_URL}${handlerEndpoint} for ${normalizedEndpoint}`);
      
      // Return the base URL - the actual path will be handled in the payload by runpodFetch
      return `${RUNPOD_API_URL}${handlerEndpoint}`;
    }
  } else {
    // For local development: ensure we have the API prefix
    // If endpoint doesn't start with API prefix, add it
    if (!normalizedEndpoint.startsWith('/api/v1')) {
      normalizedEndpoint = `/api/v1${normalizedEndpoint}`;
    }
    
    console.log(`Using local API: ${normalizedEndpoint}`);
    return normalizedEndpoint;
  }
};

/**
 * Creates a test function to verify both the API connection 
 * and specifically the RunPod connection when on production
 */
export const testRunPodConnection = async (): Promise<boolean> => {
  try {
    // Log connection attempt when running in development
    const isLocalDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1';
    if (isLocalDevelopment) {
      console.log(`Testing RunPod API connection to: ${RUNPOD_API_URL}/health`);
    }
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Use the standardized API URL function to get the right URL
    const apiUrl = isLocalDevelopment ? `${RUNPOD_API_URL}/health` : getApiUrl('/api/v1/health');
    
    console.log(`Testing RunPod API connection to: ${apiUrl}`);
    
    // Force a direct RunPod API call to verify connection 
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('RunPod API connection successful!');
      return true;
    } else {
      console.error('RunPod API responded but with an error status:', response.status);
      
      // Try to get error details
      try {
        const errorText = await response.text();
        console.error('Error response:', errorText);
      } catch (e) {
        // Ignore parsing errors
      }
      
      return false;
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('RunPod API connection timed out after 5 seconds');
    } else {
      console.error('RunPod API connection failed:', error);
    }
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
    console.log("Checking API connection...");
    console.log(`Current URL: ${window.location.href}`);
    console.log(`API health check URL: ${getApiUrl('/status/health')}`);
    
    const response = await fetch(getApiUrl('/status/health'), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // Set short timeout to avoid hanging
      signal: AbortSignal.timeout(5000)
    });
    
    console.log(`API health check response status: ${response.status}`);
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log("API health check response data:", data);
      } catch (e) {
        console.log("API response not parseable as JSON");
      }
      
      console.log("API connection successful");
      return true;
    } else {
      console.error(`API connection failed with status: ${response.status}`);
      
      // Try to get more error details
      try {
        const errorText = await response.text();
        console.error("Error details:", errorText);
      } catch (e) {
        console.error("Could not get error details");
      }
      
      return false;
    }
  } catch (error) {
    console.error("API connection error:", error);
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