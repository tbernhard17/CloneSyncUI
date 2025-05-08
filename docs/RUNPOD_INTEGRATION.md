# Vercel-RunPod Integration Setup

This document outlines the setup process for connecting a Vercel-deployed frontend with a RunPod backend API.

## Configuration Overview

The app is configured to use different APIs based on its deployment environment:

- **Development mode**: Uses the local FastAPI backend (`http://localhost:8000/api/v1/...`)
- **Production mode**: Uses the RunPod API endpoint (`https://api.runpod.ai/v2/fk5lwqqdbcmom5/...`)

## How It Works

### API URL Resolution

The system automatically detects whether it's running in production (Vercel) or development (localhost) and routes API requests to the appropriate endpoint:

```typescript
// From apiUtils.ts
export const getApiUrl = (endpoint: string): string => {
  // Check if we're running in production or development
  const isLocalDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
  
  if (!isLocalDevelopment) {
    // For production: use RunPod API URL
    return `${RUNPOD_API_URL}${cleanEndpoint}`;
  } else {
    // For local development: use relative URL
    return `${API_CONFIG.fullPath}${formattedEndpoint}`;
  }
};
```

### API Connection Monitoring

The app includes several features to monitor API connectivity:

1. **API Health Check**: Automatically monitors API connection status
2. **RunPod Connection Test**: Specifically tests the RunPod API connection
3. **Settings Panel Integration**: Connection tests available in the Settings > API tab

## Testing the Connection

### Via Browser Console

You can test the RunPod connection at any time by opening your browser's console and running:

```javascript
await window.verifyRunPodConnectivity()
```

### Via Settings Panel

1. Open the app
2. Click the Settings icon (⚙️)
3. Select the "API" tab
4. Use the "Test Connection" button in the RunPod API Connection panel

## Troubleshooting

If you encounter connection issues:

1. **Check RunPod Status**: Ensure your RunPod endpoint is active and running
2. **Verify Endpoint URL**: Confirm the `RUNPOD_API_URL` is correct
3. **Check for CORS Issues**: Look for CORS errors in the browser console
4. **Examine Response Headers**: Check that your RunPod API is returning proper CORS headers
5. **Test with curl**: Try a simple curl request to verify the API is accessible:

```bash
curl -v https://api.runpod.ai/v2/fk5lwqqdbcmom5/health
```

## Technical Implementation

- **ApiHealthCheck Component**: Monitors API connectivity and displays errors
- **RunPodConnectionTest Component**: Visually tests RunPod connection
- **testRunPodConnection Function**: Core function for testing RunPod connectivity
