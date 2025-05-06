import React from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';

interface EngineStatusIndicatorProps {
  status: EngineStatus;
}

const EngineStatusIndicator: React.FC<EngineStatusIndicatorProps> = ({ status }) => {
  const getStatusColor = (currentStatus: EngineStatus): string => {
    switch (currentStatus) {
      case 'ready':
        return 'bg-green-500';
      case 'loading':
        return 'bg-yellow-500';
      case 'error':
      case 'idle':
      default:
        return 'bg-red-500';
    }
  };

  const getStatusText = (currentStatus: EngineStatus): string => {
    switch (currentStatus) {
      case 'ready':
        return 'Engine Ready';
      case 'loading':
        return 'Engine Loading...';
      case 'error':
        return 'Engine Error / Unavailable';
      case 'idle':
      default:
        return 'Engine Idle / Not Preloaded';
    }
  };

  const colorClass = getStatusColor(status);
  const statusText = getStatusText(status);
  const isLoading = status === 'loading';

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-1 cursor-default">
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full',
                  colorClass,
                  isLoading && 'animate-pulse'
                )}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          <p>{statusText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EngineStatusIndicator; 