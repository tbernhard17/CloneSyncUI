import { useState, useEffect } from 'react';
import { Button } from './button';
import { testRunPodConnection } from '../../utils/apiUtils';
import { toast } from './use-toast';

/**
 * Component to test and display RunPod API connection status
 * Useful for verifying deployment configuration
 */
export function RunPodConnectionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  const testConnection = async () => {
    setIsLoading(true);
    try {
      const connectionSuccessful = await testRunPodConnection();
      setIsConnected(connectionSuccessful);
      
      if (connectionSuccessful) {
        toast({
          title: "RunPod API Connected",
          description: "Successfully connected to the RunPod API.",
          variant: "default",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to the RunPod API. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing RunPod connection:', error);
      setIsConnected(false);
      toast({
        title: "Connection Error",
        description: `Error testing RunPod connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test connection on component mount
  useEffect(() => {
    // Only auto-test in production environments
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    if (isProduction) {
      testConnection();
    }
  }, []);
  
  return (
    <div className="flex flex-col items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-medium">RunPod API Connection</h3>
      
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          isConnected === null ? 'bg-gray-400' : 
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span>
          {isConnected === null ? 'Not tested' : 
           isConnected ? 'Connected' : 'Not connected'}
        </span>
      </div>
      
      <Button 
        onClick={testConnection}
        variant="outline"
        disabled={isLoading}
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </Button>
      
      {isConnected === false && (
        <p className="text-sm text-red-500 text-center mt-2">
          Could not connect to RunPod API. Make sure your RunPod endpoint is running and accessible.
        </p>
      )}
      
      <div className="text-xs text-gray-500">
        RunPod URL: https://api.runpod.ai/v2/fk5lwqqdbcmom5
      </div>
    </div>
  );
}
