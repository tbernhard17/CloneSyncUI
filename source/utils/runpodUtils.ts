/**
 * RunPod API utilities to help adapt our frontend API requests to RunPod's serverless API format
 */

import { getApiUrl } from './apiUtils';

// Determine if we're in a production environment (Vercel deployment)
const isProduction = window.location.hostname !== 'localhost' && 
                  window.location.hostname !== '127.0.0.1';

/**
 * Generate CORS-friendly headers for all API requests
 * Avoids problematic headers that can trigger CORS preflight issues
 */
export const corsHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': window.location.origin
  };
};

/**
 * Create a custom fetch function that handles CORS properly for RunPod API
 * Use this for direct requests to RunPod endpoints
 */
export const fetchWithCORS = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Start with merged headers
  const mergedHeaders = new Headers(options.headers);
  
  // Add our CORS headers
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    mergedHeaders.set(key, value);
  });
  
  // Remove problematic headers that might cause CORS issues
  mergedHeaders.delete('Cache-Control');
  mergedHeaders.delete('Pragma');
  
  // Configure fetch options with CORS mode
  const corsOptions: RequestInit = {
    ...options,
    mode: 'cors',
    credentials: 'omit', // Don't send cookies to avoid CORS issues 
    headers: mergedHeaders
  };
  
  console.log(`CORS fetch for: ${url}`);
  
  try {
    return await fetch(url, corsOptions);
  } catch (error) {
    console.error('CORS fetch error:', error);
    throw error;
  }
};

/**
 * Helper function to adapt file data for RunPod's serverless API
 * In RunPod, file uploads need to be encoded in a specific format
 * 
 * @param file - The file to upload
 * @returns Promise resolving to the encoded file data
 */
export const encodeFileForRunPod = async (file: File): Promise<{
  file_name: string;
  content_type: string;
  file_data: string;
  is_base64: boolean;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Convert result to Base64
      const base64 = reader.result as string;
      // Remove the "data:type/subtype;base64," prefix
      const base64Clean = base64.split(',')[1];
      
      resolve({
        file_name: file.name,
        content_type: file.type || 'application/octet-stream',
        file_data: base64Clean,
        is_base64: true
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Adapts a FormData object for RunPod serverless API
 * Converts file objects to base64 encoded data
 * 
 * @param formData - The FormData object to adapt
 * @returns Promise resolving to the adapted payload object for RunPod
 */
export const adaptFormDataForRunPod = async (formData: FormData): Promise<any> => {
  const adaptePayload: any = {};
  const filePromises: Promise<void>[] = [];
  adaptePayload.files = {};
  
  // Process each FormData entry
  formData.forEach((value, key) => {
    if (value instanceof File) {
      // For file entries, convert to base64
      const filePromise = encodeFileForRunPod(value).then(fileData => {
        adaptePayload.files[key] = fileData;
      });
      filePromises.push(filePromise);
    } else {
      // For non-file entries, add directly
      adaptePayload[key] = value;
    }
  });
  
  // Wait for all file conversions to complete
  await Promise.all(filePromises);
  
  return adaptePayload;
};

/**
 * Adapts a fetch request configuration for RunPod serverless API
 * This allows our existing fetch calls to work with RunPod's API format
 * 
 * @param url - The original URL
 * @param options - The original fetch options
 * @returns Object with adapted URL and options for RunPod
 */
export const adaptFetchForRunPod = async (
  url: string,
  options: RequestInit = {}
): Promise<{
  adaptedUrl: string;
  adaptedOptions: RequestInit;
}> => {
  if (!isProduction) {
    // In development, no adaptation needed
    return { adaptedUrl: url, adaptedOptions: options };
  }
  
  // Extract the path without the API prefix
  const path = url.replace(/^(?:https?:\/\/[^/]+)?(?:\/api\/v1)?/i, '');
  
  // Create RunPod payload
  const runpodPayload: any = {
    endpoint: path,
    method: options.method || 'GET'
  };
  
  if (options.body) {
    if (options.body instanceof FormData) {
      // Handle FormData (file uploads)
      runpodPayload.payload = await adaptFormDataForRunPod(options.body);
    } else if (typeof options.body === 'string') {
      // Handle JSON strings
      try {
        runpodPayload.payload = JSON.parse(options.body);
      } catch (e) {
        runpodPayload.payload = { data: options.body };
      }
    } else {
      // Handle other body types
      runpodPayload.payload = options.body;
    }
  }
    // Create new options for RunPod API with proper headers
  const adaptedOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': window.location.origin,
      // Remove problematic headers that cause CORS issues
      'Cache-Control': undefined,
      'Pragma': undefined
    },
    mode: 'cors', // Explicitly set CORS mode
    credentials: 'omit', // Don't send cookies to avoid CORS issues
    body: JSON.stringify(runpodPayload)
  };
  
  // Use RunPod base URL
  const baseUrl = 'https://api.runpod.ai/v2/fk5lwqqdbcmom5';
  // For direct API access endpoints like upload, use direct path instead of /run
  const adaptedUrl = path.includes('/upload/') ? 
    `${baseUrl}${path}` : // Direct path for file uploads 
    `${baseUrl}/run`;     // Standard endpoint for normal operations
  
  console.log('RunPod adapted request:', { adaptedUrl, method: adaptedOptions.method });
  
  return { adaptedUrl, adaptedOptions };
};

/**
 * Adapted fetch function for RunPod API
 * Use this as a drop-in replacement for fetch() to support RunPod's API format
 * 
 * @param url - The URL to fetch
 * @param options - The fetch options
 * @returns Promise with fetch response
 */
export const runpodFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    console.log(`RunPod fetch for URL: ${url}`);
    const { adaptedUrl, adaptedOptions } = await adaptFetchForRunPod(url, options);
    
    // Add retry logic for network errors
    const MAX_RETRIES = 3;
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount < MAX_RETRIES) {
      try {
        const response = await fetch(adaptedUrl, adaptedOptions);
        
        // Log response status for debugging
        console.log(`RunPod response status: ${response.status} for ${adaptedUrl}`);
        
        if (!response.ok && (response.status === 401 || response.status === 403)) {
          console.error('Authentication error with RunPod API. Check API key configuration.');
        }
        
        return response;
      } catch (error) {
        lastError = error;
        retryCount++;
        console.warn(`RunPod fetch retry ${retryCount}/${MAX_RETRIES} after error:`, error);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    throw lastError || new Error('Failed to fetch after multiple retries');
  } catch (error) {
    console.error('Error in runpodFetch:', error);
    throw error;
  }
};

/**
 * Test if a file upload would work with RunPod
 * 
 * @returns Promise resolving to boolean indicating success
 */
export const testRunPodFileUpload = async (): Promise<boolean> => {
  try {
    // Create a small test file
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', testFile);
    
    // Attempt RunPod fetch adaptation
    const { adaptedUrl, adaptedOptions } = await adaptFetchForRunPod(
      'https://api.runpod.ai/v2/fk5lwqqdbcmom5/upload/test',
      {
        method: 'POST',
        body: formData
      }
    );
    
    console.log('RunPod fetch adaptation test:');
    console.log('- Adapted URL:', adaptedUrl);
    console.log('- Adapted payload:', JSON.parse(adaptedOptions.body as string));
    
    return true;
  } catch (error) {
    console.error('RunPod file upload test failed:', error);
    return false;
  }
};
