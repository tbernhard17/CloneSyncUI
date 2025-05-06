import { CloudCog, Settings, Film, MessageSquareText, Upload, FolderOpen, Music, Video, Sliders, BarChart2, WavesIcon } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { API_VERSION } from '../utils/api';
import { apiRequest } from '../utils/apiUtils';

// API endpoint - use relative URL format for same-domain deployment
const API_PATH = API_VERSION;

interface HeaderProps {
  onTTSToggle: () => void;
  onFileSelected?: (fileType: 'audio' | 'video', file: File) => void;
  onLipsyncSettingsChange?: (settings: LipsyncSettings) => void;
}

interface LipsyncSettings {
  algorithm: 'wav2lip' | 'sadtalker';
  quality: number;
  useBeatAnalysis: boolean;
  faceDetectionThreshold: number;
  useLyricAlignment: boolean;
}

const Header = ({
  onTTSToggle,
  onFileSelected,
  onLipsyncSettingsChange
}: HeaderProps) => {
  const { toast } = useToast();
  const [showTTS, setShowTTS] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // State for dialog visibility
  const [showLipsyncQualityDialog, setShowLipsyncQualityDialog] = useState(false);
  const [showLipsyncAlgorithmDialog, setShowLipsyncAlgorithmDialog] = useState(false);
  const [showBeatAnalysisDialog, setShowBeatAnalysisDialog] = useState(false);
  const [showFaceDetectionDialog, setShowFaceDetectionDialog] = useState(false);
  const [showLyricAlignmentDialog, setShowLyricAlignmentDialog] = useState(false);
  
  // State for lipsync settings
  const [lipsyncSettings, setLipsyncSettings] = useState<LipsyncSettings>({
    algorithm: 'wav2lip',
    quality: 70,
    useBeatAnalysis: false,
    faceDetectionThreshold: 0.5,
    useLyricAlignment: false
  });
  
  // Handler for Media menu
  const handleMediaClick = () => {
    console.log("Media menu clicked");
  };
  
  // Handler for Settings menu
  const handleSettingsClick = () => {
    console.log("Settings clicked");
  };
  
  // Advanced lipsync option handlers
  const handleLipsyncQuality = () => {
    setShowLipsyncQualityDialog(true);
  };
  
  const handleLipsyncAlgorithm = () => {
    setShowLipsyncAlgorithmDialog(true);
  };
  
  const handleBeatAnalysis = () => {
    setShowBeatAnalysisDialog(true);
  };
  
  const handleFaceDetection = () => {
    setShowFaceDetectionDialog(true);
  };
  
  const handleLyricAlignment = () => {
    setShowLyricAlignmentDialog(true);
  };
  
  // Save settings and notify backend when settings change
  const updateLipsyncSettings = async (newSettings: Partial<LipsyncSettings>) => {
    try {
      const updatedSettings = { ...lipsyncSettings, ...newSettings };
      setLipsyncSettings(updatedSettings);
      
      // Notify parent component about the settings change
      if (onLipsyncSettingsChange) {
        onLipsyncSettingsChange(updatedSettings);
      }
      
      // Use apiRequest from apiUtils with the correct endpoint pattern '/lip_sync/settings'
      const result = await apiRequest('/lip_sync/settings', {
        method: 'POST',
        body: JSON.stringify(updatedSettings),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (result.success) {
        toast({
          title: "Settings Updated",
          description: "Lipsync settings have been saved successfully.",
        });
      } else {
        throw new Error(result.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error("Error updating lipsync settings:", error);
      toast({
        title: "Settings Error",
        description: "Failed to update lipsync settings.",
        variant: "destructive"
      });
    }
  };
  
  // Media file handlers
  const handleOpenAudioFile = () => {
    if (audioInputRef.current) {
      audioInputRef.current.click();
    }
  };
  
  const handleOpenVideoFile = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };
  
  const handleUploadMedia = async () => {
    // This will open a dialog to choose file type first
    const fileType = window.confirm("Upload audio file? Press Cancel for video file.") ? "audio" : "video";
    
    if (fileType === "audio" && audioInputRef.current) {
      audioInputRef.current.click();
    } else if (fileType === "video" && videoInputRef.current) {
      videoInputRef.current.click();
    }
  };
  
  const handleAudioFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      
      // Pass the file to parent component
      if (onFileSelected) {
        onFileSelected('audio', file);
        
        toast({
          title: "Audio File Selected",
          description: `File "${file.name}" is ready for processing.`,
        });
      }
      
      e.target.value = '';
    }
  };
  
  const handleVideoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      
      // Pass the file to parent component
      if (onFileSelected) {
        onFileSelected('video', file);
        
        toast({
          title: "Video File Selected",
          description: `File "${file.name}" is ready for processing.`,
        });
      }
      
      e.target.value = '';
    }
  };
  
  // Handler for TTS toggle
  const handleTTSToggle = () => {
    const newState = !showTTS;
    setShowTTS(newState);
    onTTSToggle(); // Pass the event up to parent
  };

  return (
    <>
      <header className="fixed top-0 w-full border-b border-white/10 bg-[#7C3AED] backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger onClick={handleSettingsClick}>
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-4">
                    <h3 className="mb-2 text-lg font-medium">Advanced Lipsync Settings</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div onClick={handleLipsyncQuality} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100">
                        <Sliders className="h-5 w-5" />
                        <div>
                          <div className="text-sm font-medium">Quality Settings</div>
                          <div className="text-xs text-slate-500">Adjust quality and performance</div>
                        </div>
                      </div>
                      <div onClick={handleLipsyncAlgorithm} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100">
                        <Video className="h-5 w-5" />
                        <div>
                          <div className="text-sm font-medium">Lipsync Algorithm</div>
                          <div className="text-xs text-slate-500">Choose SadTalker or Wav2Lip</div>
                        </div>
                      </div>
                      <div onClick={handleBeatAnalysis} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100">
                        <BarChart2 className="h-5 w-5" />
                        <div>
                          <div className="text-sm font-medium">Beat Analysis</div>
                          <div className="text-xs text-slate-500">Sync speech to audio beats</div>
                        </div>
                      </div>
                      <div onClick={handleFaceDetection} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100">
                        <FolderOpen className="h-5 w-5" />
                        <div>
                          <div className="text-sm font-medium">Face Detection</div>
                          <div className="text-xs text-slate-500">Tune face detection settings</div>
                        </div>
                      </div>
                      <div onClick={handleLyricAlignment} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100">
                        <WavesIcon className="h-5 w-5" />
                        <div>
                          <div className="text-sm font-medium">Lyric Alignment</div>
                          <div className="text-xs text-slate-500">Fine-tune word synchronization</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger onClick={handleMediaClick}>
                  <Film className="h-5 w-5 mr-2" />
                  Media
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[250px] p-4">
                    <h3 className="mb-2 text-lg font-medium">Media Files</h3>
                    <div className="flex flex-col gap-2">
                      <button onClick={handleOpenAudioFile} className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 w-full text-left">
                        <Music className="h-5 w-5" />
                        <span>Open Audio File</span>
                      </button>
                      <button onClick={handleOpenVideoFile} className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 w-full text-left">
                        <Video className="h-5 w-5" />
                        <span>Open Video File</span>
                      </button>
                      <button onClick={handleUploadMedia} className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 w-full text-left">
                        <Upload className="h-5 w-5" />
                        <span>Upload Media</span>
                      </button>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  onClick={handleTTSToggle}
                  className={showTTS ? "bg-purple-800 text-white" : ""}
                >
                  <MessageSquareText className="h-5 w-5 mr-2" />
                  TTS
                </NavigationMenuTrigger>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          <div className="flex items-center gap-2">
            <CloudCog className="h-8 w-8 mr-2 text-white" />
            <span className="text-xl font-semibold text-white">Clone Sync</span>
          </div>
        </div>
        
        {/* Hidden file inputs */}
        <input 
          type="file" 
          ref={audioInputRef} 
          className="hidden" 
          accept="audio/*" 
          onChange={handleAudioFileSelected} 
        />
        <input 
          type="file" 
          ref={videoInputRef} 
          className="hidden" 
          accept="video/*" 
          onChange={handleVideoFileSelected} 
        />
      </header>

      {/* Settings Dialogs */}
      
      {/* Lipsync Quality Dialog */}
      <Dialog open={showLipsyncQualityDialog} onOpenChange={setShowLipsyncQualityDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Lipsync Quality Settings</DialogTitle>
            <DialogDescription>
              Adjust the quality level for lip synchronization. Higher quality may take longer to process.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex flex-col space-y-4">
              <Label htmlFor="quality-slider">Quality Level: {lipsyncSettings.quality}%</Label>
              <Slider 
                id="quality-slider"
                min={10} 
                max={100} 
                step={5}
                defaultValue={[lipsyncSettings.quality]}
                onValueChange={(values) => {
                  setLipsyncSettings({...lipsyncSettings, quality: values[0]});
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => {
              updateLipsyncSettings({quality: lipsyncSettings.quality});
              setShowLipsyncQualityDialog(false);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Lipsync Algorithm Dialog */}
      <Dialog open={showLipsyncAlgorithmDialog} onOpenChange={setShowLipsyncAlgorithmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Lipsync Algorithm</DialogTitle>
            <DialogDescription>
              Choose which algorithm to use for lip synchronization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup
              defaultValue={lipsyncSettings.algorithm}
              onValueChange={(value) => setLipsyncSettings({
                ...lipsyncSettings, 
                algorithm: value as 'wav2lip' | 'sadtalker'
              })}
            >
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="wav2lip" id="wav2lip" />
                <Label htmlFor="wav2lip">Wav2Lip (Recommended)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sadtalker" id="sadtalker" />
                <Label htmlFor="sadtalker">SadTalker (Experimental)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <DialogFooter>
            <Button onClick={() => {
              updateLipsyncSettings({algorithm: lipsyncSettings.algorithm});
              setShowLipsyncAlgorithmDialog(false);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Beat Analysis Dialog */}
      <Dialog open={showBeatAnalysisDialog} onOpenChange={setShowBeatAnalysisDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Beat Analysis Settings</DialogTitle>
            <DialogDescription>
              Configure audio beat analysis for improved lip synchronization timing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="beat-analysis"
                checked={lipsyncSettings.useBeatAnalysis}
                onCheckedChange={(checked) => {
                  setLipsyncSettings({...lipsyncSettings, useBeatAnalysis: checked});
                }}
              />
              <Label htmlFor="beat-analysis">Enable Beat Analysis</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => {
              updateLipsyncSettings({useBeatAnalysis: lipsyncSettings.useBeatAnalysis});
              setShowBeatAnalysisDialog(false);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Face Detection Dialog */}
      <Dialog open={showFaceDetectionDialog} onOpenChange={setShowFaceDetectionDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Face Detection Settings</DialogTitle>
            <DialogDescription>
              Adjust face detection sensitivity and threshold.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex flex-col space-y-4">
              <Label htmlFor="face-threshold">
                Detection Threshold: {lipsyncSettings.faceDetectionThreshold.toFixed(2)}
              </Label>
              <Slider 
                id="face-threshold"
                min={0.1} 
                max={1} 
                step={0.05}
                defaultValue={[lipsyncSettings.faceDetectionThreshold]}
                onValueChange={(values) => {
                  setLipsyncSettings({...lipsyncSettings, faceDetectionThreshold: values[0]});
                }}
              />
              <p className="text-xs text-muted-foreground">
                Lower values (0.1-0.4) detect more faces but may include false positives.
                Higher values (0.6-1.0) only detect very clear faces.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => {
              updateLipsyncSettings({faceDetectionThreshold: lipsyncSettings.faceDetectionThreshold});
              setShowFaceDetectionDialog(false);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Lyric Alignment Dialog */}
      <Dialog open={showLyricAlignmentDialog} onOpenChange={setShowLyricAlignmentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Lyric Alignment Settings</DialogTitle>
            <DialogDescription>
              Configure word-level synchronization for improved lip movements.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="lyric-alignment"
                checked={lipsyncSettings.useLyricAlignment}
                onCheckedChange={(checked) => {
                  setLipsyncSettings({...lipsyncSettings, useLyricAlignment: checked});
                }}
              />
              <Label htmlFor="lyric-alignment">Enable Lyric Alignment</Label>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Lyric alignment provides more precise word-by-word lip synchronization.
              Best for close-up videos where precision is critical.
            </p>
          </div>
          
          <DialogFooter>
            <Button onClick={() => {
              updateLipsyncSettings({useLyricAlignment: lipsyncSettings.useLyricAlignment});
              setShowLyricAlignmentDialog(false);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;