import React from 'react';
import { getEngineInfo, EngineInfo } from '@/utils/lipsync-engines';
import { EngineType } from '@/context/EngineContext';
import { Video, MonitorPlay, CloudCog, CheckCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EngineInfoCardProps {
  engineId: EngineType;
  isSelected?: boolean;
  onClick?: () => void;
  showDetails?: boolean;
}

const EngineInfoCard: React.FC<EngineInfoCardProps> = ({ 
  engineId, 
  isSelected = false,
  onClick,
  showDetails = false 
}) => {
  const engineInfo = getEngineInfo(engineId);

  const renderIcon = () => {
    switch (engineId) {
      case 'wav2lip':
        return <Video className="h-5 w-5 text-purple-300" />;
      case 'sadtalker':
        return <MonitorPlay className="h-5 w-5 text-purple-300" />;
      case 'geneface':
        return <CloudCog className="h-5 w-5 text-purple-300" />;
      default:
        return <Video className="h-5 w-5 text-purple-300" />;
    }
  };

  return (
    <div 
      className={`flex items-start p-3 rounded-md transition-colors ${
        isSelected 
          ? 'bg-white/10 border border-purple-300/30' 
          : 'hover:bg-white/5 border border-transparent'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex-shrink-0 mr-3 mt-1">
        {renderIcon()}
      </div>
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white flex items-center">
            {engineInfo.name}
            {showDetails && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                    <div className="max-w-[250px]">
                      <p className="text-xs mb-2">{engineInfo.description}</p>
                      <div className="text-xs font-semibold mb-1">Features:</div>
                      <ul className="text-xs list-disc pl-4 space-y-1">
                        {engineInfo.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </h4>
          {isSelected && (
            <CheckCircle className="h-4 w-4 text-green-400" />
          )}
        </div>
        <p className="text-xs text-gray-300 mb-1">{engineInfo.description}</p>
        {showDetails && (
          <div className="mt-2">
            <div className="text-xs text-white/70 mb-1">Best for:</div>
            <div className="flex flex-wrap gap-1">
              {engineInfo.recommendedFor.map((item, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-purple-700/30 rounded-full text-purple-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngineInfoCard; 