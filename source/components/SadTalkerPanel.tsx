import React, { useState } from 'react';
import { 
  Video, 
  Settings, 
  Eye, 
  Monitor, 
  Shuffle, 
  Sparkles, 
  CopyCheck, 
  Maximize,
  Video as VideoIcon,
  Info
} from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from '@/context/SettingsContext';
import { updateLipsyncSettings as updateBackendLipsyncSettings } from "@/utils/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SadTalkerPanel: React.FC = () => {
  const { lipsyncSettings, updateLipsyncSettings } = useSettings();
  const [refVideo, setRefVideo] = useState<File | null>(null);
  
  // File input refs
  const refEyeblinkRef = React.useRef<HTMLInputElement>(null);
  const refPoseRef = React.useRef<HTMLInputElement>(null);

  const handleSettingChange = (key: string, value: any) => {
    // Create an update object with the key
    const update = { [key]: value } as any;
    
    // Update local settings
    updateLipsyncSettings(update);
    
    // Convert to snake_case for backend API
    const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    const apiUpdate = { [apiKey]: value };
    
    // Send to backend
    updateBackendLipsyncSettings(apiUpdate).catch(error => {
      console.error(`Error updating ${key}:`, error);
    });
  };

  const handleFileSelect = (type: 'eyeblink' | 'pose', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Store file locally for display purposes
    if (type === 'eyeblink') {
      setRefVideo(file);
      
      // Create a file URL to pass to backend
      const fileUrl = URL.createObjectURL(file);
      handleSettingChange('refEyeblink', fileUrl);
    } else if (type === 'pose') {
      setRefVideo(file);
      
      // Create a file URL to pass to backend
      const fileUrl = URL.createObjectURL(file);
      handleSettingChange('refPose', fileUrl);
    }
  };

  return (
    <div className="p-3 bg-white/5 rounded-md border border-purple-300/10">
      <h3 className="text-sm font-medium text-white mb-3">SadTalker Advanced Settings</h3>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="basic-settings" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2 text-purple-300" />
              Basic Settings
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Still Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="still-mode"
                    checked={lipsyncSettings.stillMode || false}
                    onCheckedChange={(checked) => handleSettingChange('stillMode', checked)}
                  />
                  <div>
                    <Label htmlFor="still-mode" className="text-white flex items-center">
                      Still Mode
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                            <p className="text-xs max-w-[200px]">
                              Use the same pose parameters as the original image. Results in fewer head movements.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <p className="text-xs text-gray-400">Reduce head motion</p>
                  </div>
                </div>
              </div>
              
              {/* Expression Scale Slider */}
              <div>
                <Label htmlFor="expression-scale" className="text-white flex items-center">
                  Expression Intensity
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Controls the intensity of facial expressions. Higher values make expressions stronger.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Slider 
                  id="expression-scale"
                  value={[lipsyncSettings.expressionScale || 1.0]} 
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  onValueChange={([value]) => handleSettingChange('expressionScale', value)}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Subtle</span>
                  <span>{lipsyncSettings.expressionScale?.toFixed(1) || '1.0'}</span>
                  <span>Exaggerated</span>
                </div>
              </div>
              
              {/* Batch Size */}
              <div>
                <Label htmlFor="batch-size" className="text-white flex items-center">
                  Batch Size
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Number of frames processed at once. Higher values use more GPU but can be faster.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Slider 
                  id="batch-size"
                  value={[lipsyncSettings.batchSize || 2]} 
                  min={1}
                  max={8}
                  step={1}
                  onValueChange={([value]) => handleSettingChange('batchSize', value)}
                />
                <div className="text-xs text-white mt-1 text-right">{lipsyncSettings.batchSize || 2}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="preprocess-mode" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <CopyCheck className="h-4 w-4 mr-2 text-purple-300" />
              Preprocess Mode
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <RadioGroup 
                value={lipsyncSettings.preprocessMode || 'crop'} 
                onValueChange={(value) => handleSettingChange('preprocessMode', value as 'crop' | 'resize' | 'full')}
                className="space-y-2"
              >
                <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5 text-white">
                  <RadioGroupItem value="crop" id="preprocess-crop" />
                  <div>
                    <Label htmlFor="preprocess-crop" className="text-sm font-medium text-white">Crop</Label>
                    <p className="text-xs text-gray-300">Only animates the cropped face region</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5 text-white">
                  <RadioGroupItem value="resize" id="preprocess-resize" />
                  <div>
                    <Label htmlFor="preprocess-resize" className="text-sm font-medium text-white">Resize</Label>
                    <p className="text-xs text-gray-300">Resizes whole image for ID-photo style</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5 text-white">
                  <RadioGroupItem value="full" id="preprocess-full" />
                  <div>
                    <Label htmlFor="preprocess-full" className="text-sm font-medium text-white">Full</Label>
                    <p className="text-xs text-gray-300">Animates face and places back in full image</p>
                  </div>
                </div>
              </RadioGroup>
              
              <div className="text-xs p-2 bg-purple-900/20 rounded text-purple-200 flex items-start">
                <Info className="h-3.5 w-3.5 mr-1 mt-0.5 flex-shrink-0" />
                <span>
                  For full-body images, use "Crop" mode for face close-ups or "Full" mode with Still Mode enabled.
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="enhancer-settings" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-purple-300" />
              Enhancement Options
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Face Enhancer */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="use-enhancer"
                  checked={lipsyncSettings.useEnhancer || false}
                  onCheckedChange={(checked) => handleSettingChange('useEnhancer', checked)}
                />
                <div>
                  <Label htmlFor="use-enhancer" className="text-white">Use Face Enhancer</Label>
                  <p className="text-xs text-gray-400">GFPGAN face restoration (higher quality, slower)</p>
                </div>
              </div>
              
              {/* Pose Style */}
              <div>
                <Label htmlFor="pose-style" className="text-white mb-2">Pose Style</Label>
                <Slider 
                  id="pose-style"
                  value={[lipsyncSettings.poseStyle || 0]} 
                  min={0}
                  max={45}
                  step={5}
                  onValueChange={([value]) => handleSettingChange('poseStyle', value)}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Subtle</span>
                  <span>{lipsyncSettings.poseStyle || 0}</span>
                  <span>Dramatic</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="reference-video" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <VideoIcon className="h-4 w-4 mr-2 text-purple-300" />
              Reference Videos
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Reference Eyeblink */}
              <div>
                <Label htmlFor="ref-eyeblink" className="text-white flex items-center">
                  Reference Video (Eyeblinks)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Borrow eyeblink patterns from a reference video for more natural eye movements.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="flex mt-1 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => refEyeblinkRef.current?.click()}
                    className="text-xs"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Select Video
                  </Button>
                  {lipsyncSettings.refEyeblink && (
                    <div className="text-xs bg-purple-900/20 rounded px-2 py-1 text-white flex-1 truncate">
                      Reference video selected
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={refEyeblinkRef}
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => handleFileSelect('eyeblink', e)}
                />
              </div>
              
              {/* Reference Pose */}
              <div>
                <Label htmlFor="ref-pose" className="text-white flex items-center">
                  Reference Video (Pose)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Borrow head pose movements from a reference video for more natural motion.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="flex mt-1 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => refPoseRef.current?.click()}
                    className="text-xs"
                  >
                    <Shuffle className="h-3.5 w-3.5 mr-1" />
                    Select Video
                  </Button>
                  {lipsyncSettings.refPose && (
                    <div className="text-xs bg-purple-900/20 rounded px-2 py-1 text-white flex-1 truncate">
                      Reference video selected
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={refPoseRef}
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => handleFileSelect('pose', e)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="advanced-features" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <Monitor className="h-4 w-4 mr-2 text-purple-300" />
              Advanced Features
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* 3D Face Visualization */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="face3d-vis"
                  checked={lipsyncSettings.face3dVis || false}
                  onCheckedChange={(checked) => handleSettingChange('face3dVis', checked)}
                />
                <div>
                  <Label htmlFor="face3d-vis" className="text-white">3D Face Visualization</Label>
                  <p className="text-xs text-gray-400">Generate 3D rendered face</p>
                </div>
              </div>
              
              {/* Free View Controls */}
              <div className="pt-2">
                <Label className="text-white flex items-center">
                  Free View Controls
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Control head rotation angles. Add 2-3 values to define keyframes for movement.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                
                {/* Yaw Input (Left-Right) */}
                <div className="mt-2">
                  <Label htmlFor="input-yaw" className="text-xs text-gray-300">Yaw (Left-Right)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="input-yaw"
                      placeholder="-20 30 10"
                      className="bg-slate-700 border-slate-600 text-white"
                      value={lipsyncSettings.inputYaw?.join(' ') || ''}
                      onChange={(e) => {
                        const values = e.target.value.split(' ')
                          .map(v => parseFloat(v))
                          .filter(v => !isNaN(v));
                        handleSettingChange('inputYaw', values.length > 0 ? values : undefined);
                      }}
                    />
                    <Maximize className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Values between -90 and 90
                  </p>
                </div>
                
                {/* Pitch Input (Up-Down) */}
                <div className="mt-2">
                  <Label htmlFor="input-pitch" className="text-xs text-gray-300">Pitch (Up-Down)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="input-pitch"
                      placeholder="-20 0 20"
                      className="bg-slate-700 border-slate-600 text-white"
                      value={lipsyncSettings.inputPitch?.join(' ') || ''}
                      onChange={(e) => {
                        const values = e.target.value.split(' ')
                          .map(v => parseFloat(v))
                          .filter(v => !isNaN(v));
                        handleSettingChange('inputPitch', values.length > 0 ? values : undefined);
                      }}
                    />
                    <Maximize className="h-4 w-4 text-gray-400 rotate-90" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Values between -90 and 90
                  </p>
                </div>
                
                {/* Roll Input (Tilt) */}
                <div className="mt-2">
                  <Label htmlFor="input-roll" className="text-xs text-gray-300">Roll (Tilt)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="input-roll"
                      placeholder="-10 0 10"
                      className="bg-slate-700 border-slate-600 text-white"
                      value={lipsyncSettings.inputRoll?.join(' ') || ''}
                      onChange={(e) => {
                        const values = e.target.value.split(' ')
                          .map(v => parseFloat(v))
                          .filter(v => !isNaN(v));
                        handleSettingChange('inputRoll', values.length > 0 ? values : undefined);
                      }}
                    />
                    <Maximize className="h-4 w-4 text-gray-400 rotate-45" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Values between -90 and 90
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="text-xs text-purple-200/70 mt-4 p-2 bg-purple-900/20 rounded">
        <p className="flex items-start">
          <Info className="h-3.5 w-3.5 mr-1 mt-0.5 flex-shrink-0" />
          <span>
            For best results with full body images, use "still" mode with "full" preprocess mode. 
            Use "crop" mode for facial close-ups.
          </span>
        </p>
      </div>
    </div>
  );
};

export default SadTalkerPanel; 