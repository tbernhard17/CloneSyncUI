/**
 * Simple utility to test RunPod connectivity from the frontend
 * This can be run in the browser console to verify connections
 */
import { testRunPodConnection } from './apiUtils';

/**
 * Tests and reports RunPod connectivity
 * Can be used during development or production to check communication
 */
export const verifyRunPodConnectivity = async () => {
  console.log('Testing RunPod API connection...');
  try {
    const isConnected = await testRunPodConnection();
    if (isConnected) {
      console.log('✅ RunPod connection successful!');
      console.log('The frontend can communicate with the RunPod API.');
      return true;
    } else {
      console.error('❌ RunPod connection failed.');
      console.error('The frontend cannot communicate with the RunPod API.');
      console.log('Tips:');
      console.log('- Make sure your RunPod endpoint is running');
      console.log('- Check for CORS issues in Network tab');
      console.log('- Verify the RunPod API URL is correct');
      return false;
    }
  } catch (error) {
    console.error('❌ RunPod connection test error:', error);
    return false;
  }
};

// Make it available on window for easy testing in Console
declare global {
  interface Window {
    verifyRunPodConnectivity: () => Promise<boolean>;
  }
}

if (typeof window !== 'undefined') {
  window.verifyRunPodConnectivity = verifyRunPodConnectivity;
}
