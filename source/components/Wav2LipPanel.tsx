import React from 'react';
import { 
  Video, 
  Settings, 
  Zap, 
  Crop,
  Move,
  Layers,
  PictureInPicture,
  Brush,
  RefreshCw,
  Info,
  ImagePlus
} from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const Wav2LipPanel: React.FC = () => {
  const { lipsyncSettings, updateLipsyncSettings } = useSettings();

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

  // Update face padding settings
  const handlePadChange = (direction: 'top' | 'bottom' | 'left' | 'right', value: number) => {
    const updatedPads = {
      ...lipsyncSettings.pads,
      [direction]: value
    };
    
    handleSettingChange('pads', updatedPads);
  };

  return (
    <div className="p-3 bg-white/5 rounded-md border border-purple-300/10">
      <h3 className="text-sm font-medium text-white mb-3">Wav2Lip Advanced Settings</h3>
      
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
              {/* Smoothing */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="nosmooth"
                  checked={!lipsyncSettings.nosmooth}
                  onCheckedChange={(checked) => handleSettingChange('nosmooth', !checked)}
                />
                <div>
                  <Label htmlFor="nosmooth" className="text-white flex items-center">
                    Smooth Output
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Applies smoothing to lip movements for more natural looking results. 
                            Disabling may cause jittery lip movements but can improve audio precision.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Enable smooth transitions between lip movements</p>
                </div>
              </div>
              
              {/* Quality Setting */}
              <div>
                <Label htmlFor="quality-level" className="text-white flex items-center">
                  Quality Level
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Controls the quality of lip-sync. Higher values provide better synchronization but take longer to process.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Slider 
                  id="quality-level"
                  value={[lipsyncSettings.quality]} 
                  min={10}
                  max={100}
                  step={10}
                  onValueChange={([value]) => handleSettingChange('quality', value)}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Faster</span>
                  <span>{lipsyncSettings.quality}%</span>
                  <span>Higher Quality</span>
                </div>
              </div>
              
              {/* Resize Factor */}
              <div>
                <Label htmlFor="resize-factor" className="text-white flex items-center">
                  Resize Factor
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Controls the scaling of input frames. Lower values (higher numbers) process faster but produce lower quality results.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <RadioGroup 
                  value={lipsyncSettings.resizeFactor.toString()} 
                  onValueChange={(value) => handleSettingChange('resizeFactor', parseInt(value))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="1" id="resize-1x" />
                    <Label htmlFor="resize-1x" className="text-sm text-white">1x (Original)</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="2" id="resize-2x" />
                    <Label htmlFor="resize-2x" className="text-sm text-white">2x (Half Size)</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="4" id="resize-4x" />
                    <Label htmlFor="resize-4x" className="text-sm text-white">4x (Quarter Size)</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-gray-400 mt-1">Lower values = better quality but slower</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="face-padding" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <Crop className="h-4 w-4 mr-2 text-purple-300" />
              Face Padding
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="text-xs p-2 bg-purple-900/20 rounded text-purple-200 flex items-start mb-4">
                <Info className="h-3.5 w-3.5 mr-1 mt-0.5 flex-shrink-0" />
                <span>
                  Control the padding around detected faces. Proper padding ensures all facial 
                  movements are captured but excessive padding can include unwanted background elements.
                </span>
              </div>
              
              {/* Top Padding */}
              <div>
                <Label htmlFor="pad-top" className="text-white flex items-center">
                  Top Padding
                </Label>
                <Slider 
                  id="pad-top"
                  value={[lipsyncSettings.pads.top]} 
                  min={0}
                  max={50}
                  step={5}
                  onValueChange={([value]) => handlePadChange('top', value)}
                />
                <div className="text-xs text-white mt-1 text-right">{lipsyncSettings.pads.top} px</div>
              </div>
              
              {/* Bottom Padding */}
              <div>
                <Label htmlFor="pad-bottom" className="text-white flex items-center">
                  Bottom Padding
                </Label>
                <Slider 
                  id="pad-bottom"
                  value={[lipsyncSettings.pads.bottom]} 
                  min={0}
                  max={50}
                  step={5}
                  onValueChange={([value]) => handlePadChange('bottom', value)}
                />
                <div className="text-xs text-white mt-1 text-right">{lipsyncSettings.pads.bottom} px</div>
              </div>
              
              {/* Left Padding */}
              <div>
                <Label htmlFor="pad-left" className="text-white flex items-center">
                  Left Padding
                </Label>
                <Slider 
                  id="pad-left"
                  value={[lipsyncSettings.pads.left]} 
                  min={0}
                  max={50}
                  step={5}
                  onValueChange={([value]) => handlePadChange('left', value)}
                />
                <div className="text-xs text-white mt-1 text-right">{lipsyncSettings.pads.left} px</div>
              </div>
              
              {/* Right Padding */}
              <div>
                <Label htmlFor="pad-right" className="text-white flex items-center">
                  Right Padding
                </Label>
                <Slider 
                  id="pad-right"
                  value={[lipsyncSettings.pads.right]} 
                  min={0}
                  max={50}
                  step={5}
                  onValueChange={([value]) => handlePadChange('right', value)}
                />
                <div className="text-xs text-white mt-1 text-right">{lipsyncSettings.pads.right} px</div>
              </div>
              
              {/* Reset Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleSettingChange('pads', { top: 0, bottom: 10, left: 0, right: 0 })}
                  className="text-xs px-2 py-1 bg-purple-800/50 hover:bg-purple-800/70 rounded text-white flex items-center"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reset to Default
                </button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="preprocessing" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <PictureInPicture className="h-4 w-4 mr-2 text-purple-300" />
              Preprocessing Mode
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
                    <p className="text-xs text-gray-300">Only process and output the face region</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5 text-white">
                  <RadioGroupItem value="resize" id="preprocess-resize" />
                  <div>
                    <Label htmlFor="preprocess-resize" className="text-sm font-medium text-white">Resize</Label>
                    <p className="text-xs text-gray-300">Resize whole image (best for portrait images)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5 text-white">
                  <RadioGroupItem value="full" id="preprocess-full" />
                  <div>
                    <Label htmlFor="preprocess-full" className="text-sm font-medium text-white">Full</Label>
                    <p className="text-xs text-gray-300">Process face and place back in full image</p>
                  </div>
                </div>
              </RadioGroup>
              
              <div className="text-xs p-2 bg-purple-900/20 rounded text-purple-200 flex items-start">
                <Info className="h-3.5 w-3.5 mr-1 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Crop:</strong> Best for facial close-ups<br/>
                  <strong>Resize:</strong> Good for ID-style photos (⚠️ not for full body)<br/>
                  <strong>Full:</strong> Best for full body images
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="enhancement" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <Brush className="h-4 w-4 mr-2 text-purple-300" />
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
                  <Label htmlFor="use-enhancer" className="text-white flex items-center">
                    Face Enhancer
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Uses GFPGAN to enhance the generated face via face restoration network. 
                            Significantly improves quality but adds processing time.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Apply face restoration to improve quality</p>
                </div>
              </div>
              
              {/* Background Enhancer */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="use-background-enhancer"
                  checked={lipsyncSettings.useBackgroundEnhancer || false}
                  onCheckedChange={(checked) => handleSettingChange('useBackgroundEnhancer', checked)}
                />
                <div>
                  <Label htmlFor="use-background-enhancer" className="text-white flex items-center">
                    Background Enhancer
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Uses Real-ESRGAN to enhance the full video background.
                            Highly recommended when using 'full' mode.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Enhance background with super-resolution</p>
                </div>
              </div>
              
              {/* Zero Mouth */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="zero-mouth"
                  checked={lipsyncSettings.zeroMouth || false}
                  onCheckedChange={(checked) => handleSettingChange('zeroMouth', checked)}
                />
                <div>
                  <Label htmlFor="zero-mouth" className="text-white flex items-center">
                    Zero Mouth
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Closes the person's mouth before proceeding with lip-syncing. Helps for cleaner starting point but may add flickering.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Close mouth before lip-syncing</p>
                </div>
              </div>
              
              {/* Mask Dilate */}
              <div>
                <Label htmlFor="mask-dilate" className="text-white flex items-center">
                  Mouth Mask Dilate
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Controls how much the mouth mask expands. Higher values cover more of the face but may include unwanted areas.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Slider 
                  id="mask-dilate"
                  value={[lipsyncSettings.maskDilate || 0]} 
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={([value]) => handleSettingChange('maskDilate', value)}
                />
                <div className="text-xs text-white mt-1 text-right">{lipsyncSettings.maskDilate || 0} px</div>
              </div>
              
              {/* Mask Blur */}
              <div>
                <Label htmlFor="mask-blur" className="text-white flex items-center">
                  Mask Blur
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Controls the smoothness of mask edges. Should be at most twice the dilate value.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Slider 
                  id="mask-blur"
                  value={[lipsyncSettings.maskBlur || 0]} 
                  min={0}
                  max={40}
                  step={1}
                  onValueChange={([value]) => handleSettingChange('maskBlur', value)}
                />
                <div className="text-xs text-white mt-1 text-right">{lipsyncSettings.maskBlur || 0} px</div>
              </div>
              
              {/* Beat Analysis */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="beat-analysis"
                  checked={lipsyncSettings.useBeatAnalysis}
                  onCheckedChange={(checked) => handleSettingChange('useBeatAnalysis', checked)}
                />
                <div>
                  <Label htmlFor="beat-analysis" className="text-white flex items-center">
                    Beat Analysis
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Analyzes audio beats to improve lip synchronization with musical content.
                            Best for music videos and singing.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Synchronize with audio beats</p>
                </div>
              </div>
              
              {/* Auto Mask */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-mask"
                  checked={lipsyncSettings.autoMask || false}
                  onCheckedChange={(checked) => handleSettingChange('autoMask', checked)}
                />
                <div>
                  <Label htmlFor="auto-mask" className="text-white flex items-center">
                    Auto Mask
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Automatically calculate the mask parameters (padding, dilate) for best results.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Automatically optimize mask settings</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="advanced" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-purple-300" />
              Advanced Settings
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Face Detection Threshold */}
              <div>
                <Label htmlFor="face-detection" className="text-white flex items-center">
                  Face Detection Threshold
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Controls the sensitivity of face detection. Higher values require more confidence 
                          in detected faces but may miss some faces.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Slider 
                  id="face-detection"
                  value={[lipsyncSettings.faceDetectionThreshold]} 
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  onValueChange={([value]) => handleSettingChange('faceDetectionThreshold', value)}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>More Sensitive</span>
                  <span>{lipsyncSettings.faceDetectionThreshold.toFixed(1)}</span>
                  <span>More Precise</span>
                </div>
              </div>
              
              {/* Lyric Alignment */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="lyric-alignment"
                  checked={lipsyncSettings.useLyricAlignment}
                  onCheckedChange={(checked) => handleSettingChange('useLyricAlignment', checked)}
                />
                <div>
                  <Label htmlFor="lyric-alignment" className="text-white flex items-center">
                    Lyric Alignment
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Uses word-level timing information to improve lip synchronization accuracy.
                            Best for precise lip movements with clear speech.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Enable word-level synchronization</p>
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
                          Number of frames processed at once. Higher values use more GPU memory but can be faster.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Slider 
                  id="batch-size"
                  value={[lipsyncSettings.batchSize || 4]} 
                  min={1}
                  max={16}
                  step={1}
                  onValueChange={([value]) => handleSettingChange('batchSize', value)}
                />
                <div className="text-xs text-white mt-1 text-right">{lipsyncSettings.batchSize || 4}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="video-features" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <Video className="h-4 w-4 mr-2 text-purple-300" />
              Video Features
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Face Swap */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enable-face-swap"
                  checked={lipsyncSettings.enableFaceSwap || false}
                  onCheckedChange={(checked) => handleSettingChange('enableFaceSwap', checked)}
                />
                <div>
                  <Label htmlFor="enable-face-swap" className="text-white flex items-center">
                    Enable Face Swap
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Enables face swapping before lip-sync processing. Requires a reference image.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Swap faces before lip-syncing</p>
                </div>
              </div>
              
              {/* Face Swap Image Input (conditionally shown) */}
              {lipsyncSettings.enableFaceSwap && (
                <div className="pl-6 border-l border-purple-300/20">
                  <Label htmlFor="face-swap-image" className="text-white text-xs mb-1 block">
                    Face Swap Reference Image
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="face-swap-image" 
                      value={lipsyncSettings.faceSwapImage || ''} 
                      onChange={(e) => handleSettingChange('faceSwapImage', e.target.value)}
                      className="bg-slate-900 border-slate-700 text-white h-8 text-xs"
                      placeholder="Path to reference image"
                    />
                    <button 
                      className="p-1 bg-purple-900/50 rounded hover:bg-purple-700/50 transition-colors"
                      onClick={() => {/* Implement file selector */}}
                    >
                      <ImagePlus className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Choose a clear frontal face image</p>
                </div>
              )}
              
              {/* Show Frame Numbers */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-frame-number"
                  checked={lipsyncSettings.showFrameNumber || false}
                  onCheckedChange={(checked) => handleSettingChange('showFrameNumber', checked)}
                />
                <div>
                  <Label htmlFor="show-frame-number" className="text-white flex items-center">
                    Show Frame Numbers
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Shows frame numbers in the top left corner. Useful for identifying frames that need modifications.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Display frame numbers (low quality only)</p>
                </div>
              </div>
              
              {/* Driving Video */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="driving-video"
                  checked={lipsyncSettings.drivingVideo || false}
                  onCheckedChange={(checked) => handleSettingChange('drivingVideo', checked)}
                />
                <div>
                  <Label htmlFor="driving-video" className="text-white flex items-center">
                    Use Driving Video
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Generate a high-quality driving video with an avatar to improve lip-sync quality.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Generate better lip-sync with a driving video</p>
                </div>
              </div>
              
              {/* Avatar Selection (conditionally shown) */}
              {lipsyncSettings.drivingVideo && (
                <div className="pl-6 border-l border-purple-300/20">
                  <Label htmlFor="driving-avatar" className="text-white text-xs mb-1 block">
                    Driving Avatar
                  </Label>
                  <RadioGroup 
                    value={lipsyncSettings.drivingAvatar || 'default'} 
                    onValueChange={(value) => handleSettingChange('drivingAvatar', value)}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="default" id="avatar-default" />
                      <Label htmlFor="avatar-default" className="text-sm text-white">Default</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="male1" id="avatar-male1" />
                      <Label htmlFor="avatar-male1" className="text-sm text-white">Male 1</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="female1" id="avatar-female1" />
                      <Label htmlFor="avatar-female1" className="text-sm text-white">Female 1</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="anime1" id="avatar-anime1" />
                      <Label htmlFor="avatar-anime1" className="text-sm text-white">Anime 1</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="audio-features" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <Layers className="h-4 w-4 mr-2 text-purple-300" />
              Audio Features
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Volume Amplification */}
              <div>
                <Label htmlFor="volume-amplification" className="text-white flex items-center">
                  Volume Amplification
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Amplifies the volume of the audio in the output. Useful for quiet audio inputs.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Slider 
                  id="volume-amplification"
                  value={[lipsyncSettings.volumeAmplification || 1]} 
                  min={1}
                  max={5}
                  step={0.1}
                  onValueChange={([value]) => handleSettingChange('volumeAmplification', value)}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Original</span>
                  <span>{lipsyncSettings.volumeAmplification?.toFixed(1) || 1}x</span>
                  <span>5x Louder</span>
                </div>
              </div>
              
              {/* Start Delay */}
              <div>
                <Label htmlFor="delay-start-time" className="text-white flex items-center">
                  Speech Start Delay
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Adds a delay before speech starts. Useful for creating natural pauses.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Slider 
                  id="delay-start-time"
                  value={[lipsyncSettings.delayStartTime || 0]} 
                  min={0}
                  max={5}
                  step={0.1}
                  onValueChange={([value]) => handleSettingChange('delayStartTime', value)}
                />
                <div className="text-xs text-white mt-1 text-right">{lipsyncSettings.delayStartTime?.toFixed(1) || 0} seconds</div>
              </div>
              
              {/* Enable Keyframe Manager */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enable-keyframe-manager"
                  checked={lipsyncSettings.enableKeyframeManager || false}
                  onCheckedChange={(checked) => handleSettingChange('enableKeyframeManager', checked)}
                />
                <div>
                  <Label htmlFor="enable-keyframe-manager" className="text-white flex items-center">
                    Enable Keyframe Manager
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Allows precise control over lip-sync settings at specific frames. 
                            Useful for complex videos with multiple scenes.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Control settings at specific keyframes</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ComfyUI Integration */}
        <AccordionItem value="comfy-ui" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <Move className="h-4 w-4 mr-2 text-purple-300" />
              ComfyUI Integration
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enable-comfy-ui"
                  checked={lipsyncSettings.enableComfyUI || false}
                  onCheckedChange={(checked) => handleSettingChange('enableComfyUI', checked)}
                />
                <div>
                  <Label htmlFor="enable-comfy-ui" className="text-white flex items-center">
                    Enable ComfyUI Integration
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Enables integration with ComfyUI for advanced workflow chaining and customization.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Chain ComfyUI workflows end to end</p>
                </div>
              </div>

              {lipsyncSettings.enableComfyUI && (
                <div className="text-xs p-2 bg-purple-900/20 rounded text-purple-200 flex items-start">
                  <Info className="h-3.5 w-3.5 mr-1 mt-0.5 flex-shrink-0" />
                  <span>
                    ComfyUI integration allows you to regenerate masks and keyframes after video modifications,
                    enabling better mouth masking and more precise control.
                  </span>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="text-xs text-purple-200/70 mt-4 p-2 bg-purple-900/20 rounded">
        <p className="flex items-start">
          <Info className="h-3.5 w-3.5 mr-1 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Recommended:</strong> For best results with full-body images, use "full" preprocess mode 
            with background enhancer enabled. For close-up portraits, use "crop" mode with face enhancer.
          </span>
        </p>
      </div>
    </div>
  );
};

export default Wav2LipPanel; 