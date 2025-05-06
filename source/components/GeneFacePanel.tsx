import React, { useState } from 'react';
import { 
  Video, 
  Settings, 
  Sparkles, 
  FileAudio,
  Brain,
  Sliders,
  ShieldCheck,
  Wand2,
  LayoutGrid,
  Upload,
  Info
} from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const GeneFacePanel: React.FC = () => {
  const { lipsyncSettings, updateLipsyncSettings } = useSettings();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  // File input ref
  const audioFileRef = React.useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAudioFile(file);
    
    // In a real implementation, you would upload this file to the server
    // and then update the settings with the file path
    const fileUrl = URL.createObjectURL(file);
    handleSettingChange('audioPath', fileUrl);
  };

  return (
    <div className="p-3 bg-white/5 rounded-md border border-purple-300/10">
      <h3 className="text-sm font-medium text-white mb-3">GeneFace Advanced Settings</h3>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="quality-settings" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <Sliders className="h-4 w-4 mr-2 text-purple-300" />
              Quality Settings
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Quality Level Slider */}
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
                          Controls the render quality. Higher values produce better results but take longer.
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
              
              {/* Frame Sampling Rate */}
              <div>
                <Label htmlFor="frame-rate" className="text-white flex items-center">
                  Frame Sampling Rate
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Controls how many frames are rendered per second. Higher values are smoother but slower.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select
                  value={lipsyncSettings.frameRate?.toString() || "25"}
                  onValueChange={(value) => handleSettingChange('frameRate', parseInt(value))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select frame rate" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="15">15 FPS</SelectItem>
                    <SelectItem value="25">25 FPS</SelectItem>
                    <SelectItem value="30">30 FPS</SelectItem>
                    <SelectItem value="60">60 FPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Use High Quality Mode */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="high-quality-mode"
                  checked={lipsyncSettings.useHighQualityMode || false}
                  onCheckedChange={(checked) => handleSettingChange('useHighQualityMode', checked)}
                />
                <div>
                  <Label htmlFor="high-quality-mode" className="text-white flex items-center">
                    High Quality Mode
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Enables super-resolution and additional enhancements. Significantly slower but higher quality.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Higher quality but much slower</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="model-settings" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <Brain className="h-4 w-4 mr-2 text-purple-300" />
              Neural Model Settings
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Neural Model Type */}
              <div>
                <Label htmlFor="model-type" className="text-white mb-2">Neural Model Type</Label>
                <RadioGroup 
                  value={lipsyncSettings.neuralModelType || 'standard'} 
                  onValueChange={(value) => handleSettingChange('neuralModelType', value)}
                  className="space-y-2"
                >
                  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5 text-white">
                    <RadioGroupItem value="standard" id="model-standard" />
                    <div>
                      <Label htmlFor="model-standard" className="text-sm font-medium text-white">Standard</Label>
                      <p className="text-xs text-gray-300">Balanced performance and quality</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5 text-white">
                    <RadioGroupItem value="lightweight" id="model-lightweight" />
                    <div>
                      <Label htmlFor="model-lightweight" className="text-sm font-medium text-white">Lightweight</Label>
                      <p className="text-xs text-gray-300">Faster but lower quality</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5 text-white">
                    <RadioGroupItem value="enhanced" id="model-enhanced" />
                    <div>
                      <Label htmlFor="model-enhanced" className="text-sm font-medium text-white">Enhanced</Label>
                      <p className="text-xs text-gray-300">Higher quality but much slower</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Expression Intensity */}
              <div>
                <Label htmlFor="expression-intensity" className="text-white flex items-center">
                  Expression Intensity
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                        <p className="text-xs max-w-[200px]">
                          Controls the intensity of facial expressions. Higher values make expressions more pronounced.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Slider 
                  id="expression-intensity"
                  value={[lipsyncSettings.expressionIntensity || 1.0]} 
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  onValueChange={([value]) => handleSettingChange('expressionIntensity', value)}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Subtle</span>
                  <span>{lipsyncSettings.expressionIntensity?.toFixed(1) || '1.0'}</span>
                  <span>Exaggerated</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="enhancement-options" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-purple-300" />
              Enhancement Options
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Post-Processing */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enable-post-processing"
                  checked={lipsyncSettings.enablePostProcessing || false}
                  onCheckedChange={(checked) => handleSettingChange('enablePostProcessing', checked)}
                />
                <div>
                  <Label htmlFor="enable-post-processing" className="text-white">Enable Post-Processing</Label>
                  <p className="text-xs text-gray-400">Apply additional enhancement filters</p>
                </div>
              </div>
              
              {/* Background Preservation */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="preserve-background"
                  checked={lipsyncSettings.preserveBackground || true}
                  onCheckedChange={(checked) => handleSettingChange('preserveBackground', checked)}
                />
                <div>
                  <Label htmlFor="preserve-background" className="text-white">Preserve Background</Label>
                  <p className="text-xs text-gray-400">Keep original background intact</p>
                </div>
              </div>
              
              {/* Super Resolution */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enable-super-resolution"
                  checked={lipsyncSettings.enableSuperResolution || false}
                  onCheckedChange={(checked) => handleSettingChange('enableSuperResolution', checked)}
                />
                <div>
                  <Label htmlFor="enable-super-resolution" className="text-white flex items-center">
                    Super Resolution
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-slate-800 border-slate-700 text-white">
                          <p className="text-xs max-w-[200px]">
                            Uses AI to enhance the resolution of output videos. Significantly increases processing time.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-xs text-gray-400">Enhance output resolution using AI</p>
                </div>
              </div>
              
              {/* Upscale Factor */}
              {lipsyncSettings.enableSuperResolution && (
                <div>
                  <Label htmlFor="upscale-factor" className="text-white mb-2">Upscale Factor</Label>
                  <RadioGroup 
                    value={lipsyncSettings.upscaleFactor?.toString() || "2"} 
                    onValueChange={(value) => handleSettingChange('upscaleFactor', parseInt(value))}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="2" id="upscale-2x" />
                      <Label htmlFor="upscale-2x" className="text-sm text-white">2x</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="4" id="upscale-4x" />
                      <Label htmlFor="upscale-4x" className="text-sm text-white">4x</Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-gray-400 mt-1">Higher values need more VRAM</p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="advanced-settings" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <Wand2 className="h-4 w-4 mr-2 text-purple-300" />
              Advanced Options
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
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
                          Number of frames processed simultaneously. Higher values need more VRAM but can be faster.
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
              
              {/* GPU Acceleration */}
              <div>
                <Label htmlFor="gpu-acceleration" className="text-white mb-2">GPU Acceleration Level</Label>
                <RadioGroup 
                  value={lipsyncSettings.gpuAcceleration || 'auto'} 
                  onValueChange={(value) => handleSettingChange('gpuAcceleration', value)}
                  className="space-y-2"
                >
                  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5 text-white">
                    <RadioGroupItem value="auto" id="gpu-auto" />
                    <div>
                      <Label htmlFor="gpu-auto" className="text-sm font-medium text-white">Auto</Label>
                      <p className="text-xs text-gray-300">Automatically detect best settings</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5 text-white">
                    <RadioGroupItem value="balanced" id="gpu-balanced" />
                    <div>
                      <Label htmlFor="gpu-balanced" className="text-sm font-medium text-white">Balanced</Label>
                      <p className="text-xs text-gray-300">Balance GPU memory and speed</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5 text-white">
                    <RadioGroupItem value="max" id="gpu-max" />
                    <div>
                      <Label htmlFor="gpu-max" className="text-sm font-medium text-white">Maximum</Label>
                      <p className="text-xs text-gray-300">Use maximum GPU resources</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Precision */}
              <div>
                <Label htmlFor="precision" className="text-white mb-2">Computation Precision</Label>
                <RadioGroup 
                  value={lipsyncSettings.precision || 'fp16'} 
                  onValueChange={(value) => handleSettingChange('precision', value)}
                  className="space-y-2"
                >
                  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5 text-white">
                    <RadioGroupItem value="fp32" id="precision-fp32" />
                    <div>
                      <Label htmlFor="precision-fp32" className="text-sm font-medium text-white">FP32</Label>
                      <p className="text-xs text-gray-300">Full precision (slower, more accurate)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-white/5 text-white">
                    <RadioGroupItem value="fp16" id="precision-fp16" />
                    <div>
                      <Label htmlFor="precision-fp16" className="text-sm font-medium text-white">FP16</Label>
                      <p className="text-xs text-gray-300">Half precision (faster, less VRAM)</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="audio-settings" className="border-b border-purple-300/30">
          <AccordionTrigger className="text-sm text-white hover:no-underline">
            <div className="flex items-center">
              <FileAudio className="h-4 w-4 mr-2 text-purple-300" />
              Audio Processing
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Audio Preprocessing */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enable-audio-preprocessing"
                  checked={lipsyncSettings.enableAudioPreprocessing || true}
                  onCheckedChange={(checked) => handleSettingChange('enableAudioPreprocessing', checked)}
                />
                <div>
                  <Label htmlFor="enable-audio-preprocessing" className="text-white">Audio Preprocessing</Label>
                  <p className="text-xs text-gray-400">Clean and normalize audio before processing</p>
                </div>
              </div>
              
              {/* Audio Normalization */}
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enable-audio-normalization"
                  checked={lipsyncSettings.enableAudioNormalization || true}
                  onCheckedChange={(checked) => handleSettingChange('enableAudioNormalization', checked)}
                />
                <div>
                  <Label htmlFor="enable-audio-normalization" className="text-white">Audio Normalization</Label>
                  <p className="text-xs text-gray-400">Standardize volume levels</p>
                </div>
              </div>
              
              {/* Audio Sample Rate */}
              <div>
                <Label htmlFor="audio-sample-rate" className="text-white mb-2">Audio Sample Rate</Label>
                <Select
                  value={lipsyncSettings.audioSampleRate?.toString() || "48000"}
                  onValueChange={(value) => handleSettingChange('audioSampleRate', parseInt(value))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select sample rate" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="16000">16 kHz (Lower quality)</SelectItem>
                    <SelectItem value="24000">24 kHz (Standard)</SelectItem>
                    <SelectItem value="44100">44.1 kHz (CD quality)</SelectItem>
                    <SelectItem value="48000">48 kHz (Professional)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="text-xs text-purple-200/70 mt-4 p-2 bg-purple-900/20 rounded">
        <p className="flex items-start">
          <Info className="h-3.5 w-3.5 mr-1 mt-0.5 flex-shrink-0" />
          <span>
            GeneFace provides high-quality neural rendering. For best results, use high-quality 
            images with good lighting and clear faces.
          </span>
        </p>
      </div>
    </div>
  );
};

export default GeneFacePanel; 