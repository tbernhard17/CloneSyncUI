import React, { useState } from "react";
import { Settings as SettingsIcon, Video, CloudCog, MonitorPlay, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSettings, LipsyncSettings, VoiceSettings } from "@/context/SettingsContext";
import VoiceTrainingModal from "./VoiceTrainingModal";
import { updateLipsyncSettings as updateBackendLipsyncSettings, updateLipsyncEngine } from "@/utils/api";
import { LIPSYNC_ENGINES, formatEngineName, getEngineInfo } from "@/utils/lipsync-engines";
import EngineInfoCard from "./EngineInfoCard";
import { EngineType } from "@/context/EngineContext";
import SadTalkerPanel from "./SadTalkerPanel";
import GeneFacePanel from "./GeneFacePanel";

const SettingsPanel: React.FC = () => {
  const { lipsyncSettings, voiceSettings, updateLipsyncSettings, updateVoiceSettings } = useSettings();
  const [showTrainingModal, setShowTrainingModal] = useState(false);

  const handleEngineChange = (engineId: EngineType) => {
    // Update local settings
    updateLipsyncSettings({ algorithm: engineId });
    
    // Send to backend to change the engine
    updateLipsyncEngine(engineId).catch(error => {
      console.error('Error updating lipsync engine:', error);
    });
  };

  return (
    <>
      <VoiceTrainingModal 
        open={showTrainingModal} 
        onOpenChange={setShowTrainingModal} 
      />
      <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20"
        >
          <SettingsIcon className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[300px] sm:w-[480px] bg-gradient-to-b from-[#7E22CE]/90 to-[#1E1B4B]/90 backdrop-blur-sm border-l border-white/20">
        <SheetHeader>
          <SheetTitle className="text-white">Settings</SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="lipsync" className="mt-6">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="lipsync">Lip Sync</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lipsync" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-white mb-2">Lip Sync Engine</h3>
                <div className="space-y-2">
                  {Object.keys(LIPSYNC_ENGINES).map((engineId) => (
                    <EngineInfoCard
                      key={engineId}
                      engineId={engineId as EngineType}
                      isSelected={lipsyncSettings.algorithm === engineId}
                      onClick={() => handleEngineChange(engineId as EngineType)}
                      showDetails={true}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-2">Quality (Higher = Better but Slower)</h3>
                <Slider 
                  value={[lipsyncSettings.quality]} 
                  min={10}
                  max={100}
                  step={5}
                  onValueChange={([value]) => {
                    // Update local settings
                    updateLipsyncSettings({ quality: value });
                    
                    // Send to backend
                    updateBackendLipsyncSettings({ quality: value }).catch(error => {
                      console.error('Error updating lipsync quality:', error);
                    });
                  }}
                />
                <div className="text-xs text-white mt-1 text-right">{lipsyncSettings.quality}%</div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="beat-analysis"
                  checked={lipsyncSettings.useBeatAnalysis}
                  onCheckedChange={(checked) => {
                    // Update local settings
                    updateLipsyncSettings({ useBeatAnalysis: checked });
                    
                    // Send to backend
                    updateBackendLipsyncSettings({ use_beat_analysis: checked }).catch(error => {
                      console.error('Error updating beat analysis setting:', error);
                    });
                  }}
                />
                <Label htmlFor="beat-analysis" className="text-white">Use Beat Analysis</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="lyric-alignment"
                  checked={lipsyncSettings.useLyricAlignment}
                  onCheckedChange={(checked) => {
                    // Update local settings
                    updateLipsyncSettings({ useLyricAlignment: checked });
                    
                    // Send to backend
                    updateBackendLipsyncSettings({ use_lyric_alignment: checked }).catch(error => {
                      console.error('Error updating lyric alignment setting:', error);
                    });
                  }}
                />
                <Label htmlFor="lyric-alignment" className="text-white">Use Lyric Alignment</Label>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-2">Face Detection Threshold</h3>
                <Slider 
                  value={[lipsyncSettings.faceDetectionThreshold]} 
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  onValueChange={([value]) => {
                    // Update local settings
                    updateLipsyncSettings({ faceDetectionThreshold: value });
                    
                    // Send to backend
                    updateBackendLipsyncSettings({ face_detection_threshold: value }).catch(error => {
                      console.error('Error updating face detection threshold:', error);
                    });
                  }}
                />
                <div className="text-xs text-white mt-1 text-right">{lipsyncSettings.faceDetectionThreshold.toFixed(1)}</div>
              </div>
              
              {lipsyncSettings.algorithm === 'wav2lip' && (
                <div className="p-3 bg-white/5 rounded-md border border-purple-300/10">
                  <h3 className="text-sm font-medium text-white mb-2">Wav2Lip Specific Settings</h3>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="nosmooth"
                      checked={lipsyncSettings.nosmooth}
                      onCheckedChange={(checked) => {
                        // Update local settings
                        updateLipsyncSettings({ nosmooth: checked });
                        
                        // Send to backend
                        updateBackendLipsyncSettings({ nosmooth: checked }).catch(error => {
                          console.error('Error updating nosmooth setting:', error);
                        });
                      }}
                    />
                    <Label htmlFor="nosmooth" className="text-white">Disable Smoothing</Label>
                  </div>
                </div>
              )}
              
              {lipsyncSettings.algorithm === 'sadtalker' && <SadTalkerPanel />}
              
              {lipsyncSettings.algorithm === 'geneface' && (
                <GeneFacePanel />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="voice" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-white mb-2">Voice Model</h3>
                <RadioGroup 
                  value={voiceSettings.model} 
                  onValueChange={(value) => updateVoiceSettings({ model: value as VoiceSettings['model'] })}
                  className="space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rvc" id="rvc" />
                    <Label htmlFor="rvc" className="text-white">RVC (Retrieval-based)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tortoise" id="tortoise" />
                    <Label htmlFor="tortoise" className="text-white">Tortoise (High Quality)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bark" id="bark" />
                    <Label htmlFor="bark" className="text-white">Bark (Fast Generation)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-2">Voice Quality</h3>
                <Slider 
                  value={[voiceSettings.quality]} 
                  min={10}
                  max={100}
                  step={5}
                  onValueChange={([value]) => updateVoiceSettings({ quality: value })}
                />
                <div className="text-xs text-white mt-1 text-right">{voiceSettings.quality}%</div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="voice-training"
                  checked={voiceSettings.enableTraining}
                  onCheckedChange={(checked) => updateVoiceSettings({ enableTraining: checked })}
                />
                <Label htmlFor="voice-training" className="text-white">Enable Voice Training</Label>
              </div>

              {voiceSettings.enableTraining && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Training Epochs</h3>
                  <Slider 
                    value={[voiceSettings.trainingEpochs]} 
                    min={10}
                    max={200}
                    step={10}
                    onValueChange={([value]) => updateVoiceSettings({ trainingEpochs: value })}
                  />
                  <div className="text-xs text-white mt-1 text-right">{voiceSettings.trainingEpochs} epochs</div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-white mb-2">Pitch Correction</h3>
                <Slider 
                  value={[voiceSettings.pitchCorrection]} 
                  min={-12}
                  max={12}
                  step={1}
                  onValueChange={([value]) => updateVoiceSettings({ pitchCorrection: value })}
                />
                <div className="text-xs text-white mt-1 text-right">{voiceSettings.pitchCorrection > 0 ? `+${voiceSettings.pitchCorrection}` : voiceSettings.pitchCorrection} semitones</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
    </>
  );
};

export default SettingsPanel;