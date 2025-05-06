import { CloudCog, Settings, Film, MessageSquareText, Upload, FolderOpen, Music, Video, Sliders, BarChart2, Waves, Mic, Layers, MonitorPlay } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
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
import { uploadFile } from "../utils/api";
import { getApiUrl, lipSync } from "../utils/apiUtils";
import { voice } from "../utils/api";
import { useEngines, EngineType } from "@/context/EngineContext";
import { LIPSYNC_ENGINES, formatEngineName } from "@/utils/lipsync-engines";
import EngineInfoCard from "./EngineInfoCard";
import EngineStatusIndicator from "./EngineStatusIndicator";
import SadTalkerPanel from "./SadTalkerPanel";
import GeneFacePanel from "./GeneFacePanel";

interface HeaderProps {
  onTTSToggle: () => void;
  onFileSelected?: (fileType: 'audio' | 'video', identifier: string, originalFilename?: string) => void;
  onLipsyncSettingsChange?: (settings: LipsyncSettings) => void;
  onTrainVoiceRequest?: () => void;
  onTaskIdUpdate?: (taskType: 'uploadTask' | 'audioTask' | 'voiceTask' | 'lipSyncTask', taskId: string) => void;
  taskIds?: {
    uploadTask: any;
    audioTask: any;
    voiceTask: any;
    lipSyncTask: any;
  };
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
  onLipsyncSettingsChange,
  onTrainVoiceRequest,
  onTaskIdUpdate,
  taskIds
}: HeaderProps) => {
  const { toast } = useToast();
  const { currentEngine, engineStatus, engines, isEngineReady, changeEngine } = useEngines();
  const [showTTS, setShowTTS] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const voiceTrainingFilesRef = useRef<HTMLInputElement>(null);
  
  // State for tracking progress of different tasks
  const [audioProgress, setAudioProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // State for dialog visibility
  const [showLipsyncQualityDialog, setShowLipsyncQualityDialog] = useState(false);
  const [showLipsyncAlgorithmDialog, setShowLipsyncAlgorithmDialog] = useState(false);
  const [showBeatAnalysisDialog, setShowBeatAnalysisDialog] = useState(false);
  const [showFaceDetectionDialog, setShowFaceDetectionDialog] = useState(false);
  const [showLyricAlignmentDialog, setShowLyricAlignmentDialog] = useState(false);
  const [showTrainVoiceDialog, setShowTrainVoiceDialog] = useState(false);
  const [showSadTalkerDialog, setShowSadTalkerDialog] = useState(false);
  const [showGeneFaceDialog, setShowGeneFaceDialog] = useState(false);
  
  // State for voice training
  const [voiceTraining, setVoiceTraining] = useState({
    modelName: "",
    epochs: 200,
    batchSize: 4,
    sampleRate: 40000,
    rvcVersion: "v2"
  });
  
  // State for lipsync settings
  const [lipsyncSettings, setLipsyncSettings] = useState<LipsyncSettings>({
    algorithm: currentEngine,
    quality: 70,
    useBeatAnalysis: false,
    faceDetectionThreshold: 0.5,
    useLyricAlignment: false
  });
  
  // Update lipsync settings when currentEngine changes
  useEffect(() => {
    setLipsyncSettings(prev => ({
      ...prev,
      algorithm: currentEngine
    }));
  }, [currentEngine]);
  
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
  
  const handleTrainVoice = () => {
    setShowTrainVoiceDialog(true);
  };
  
  const handleVoiceTrainingFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast({
        title: "Voice Training Files Selected",
        description: `${files.length} files selected for voice training.`,
      });
      
      // Keep the file selection dialog open to allow collecting more files
    }
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
      
      // Send updated settings to backend using the improved API
      await lipSync.updateSettings(updatedSettings);
      
      toast({
        title: "Settings Updated",
        description: "Lipsync settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating lipsync settings:", error);
      toast({
        title: "Settings Update Failed",
        description: "Failed to update lipsync settings. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Media file handlers for media player
  const handleOpenVideoFile = () => {
    if (videoInputRef.current) {
      // Set a custom attribute to indicate this is for media player
      videoInputRef.current.setAttribute('data-purpose', 'media-player');
      videoInputRef.current.click();
    }
  };
  
  const handleOpenAudioFile = () => {
    if (audioInputRef.current) {
      // Set a custom attribute to indicate this is for media player
      audioInputRef.current.setAttribute('data-purpose', 'media-player');
      audioInputRef.current.click();
    }
  };
  
  const handleUploadMedia = async () => {
    // This will open a dialog to choose file type first
    const fileType = window.confirm("Upload audio file? Press Cancel for video file.") ? "audio" : "video";
    
    if (fileType === "audio" && audioInputRef.current) {
      // Set a custom attribute to indicate this is for lip-sync processing
      audioInputRef.current.setAttribute('data-purpose', 'lip-sync');
      audioInputRef.current.click();
    } else if (fileType === "video" && videoInputRef.current) {
      // Set a custom attribute to indicate this is for lip-sync processing
      videoInputRef.current.setAttribute('data-purpose', 'lip-sync');
      videoInputRef.current.click();
    }
  };
  
  const handleAudioFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const originalFilename = file.name;
    const purpose = e.target.getAttribute('data-purpose') || 'lip-sync';
    e.target.removeAttribute('data-purpose');

    if (purpose === 'media-player') {
       // Media player loading still needs the File object
       // We might need a different callback for this if parent needs File
       console.warn('Media player file selection - not passing identifier yet');
       // if (onMediaPlayerFileSelected) onMediaPlayerFileSelected('audio', file);
       toast({
         title: "Audio Loaded",
         description: `File "${originalFilename}" loaded for playback.`,
       });
    } else {
      // Lip-sync processing
      setAudioProgress(0);
      
      // Use our enhanced uploadFile function
      uploadFile(
        getApiUrl('/api/v1/upload/audio'),
        file,
        (progress) => setAudioProgress(progress)
      )
      .then((response) => {
        toast({
          title: "Audio File Uploaded",
          description: `File "${originalFilename}" processed for lip-sync.`,
        });

        // === IMPORTANT CHANGE: Pass GCS identifier ===
        const gcsBlobName = response?.filename; // filename holds the GCS blob path
        const taskId = response?.task_id;

        if (gcsBlobName && onFileSelected) {
          // Pass blob name instead of File object
          onFileSelected('audio', gcsBlobName, originalFilename);
        } else {
          console.error("Upload succeeded but no GCS filename returned:", response);
          toast({ title: "Processing Error", description: "Upload succeeded but failed to get file identifier.", variant: "destructive" });
        }

        // Update task ID if present
        if (taskId && onTaskIdUpdate) {
          onTaskIdUpdate('audioTask', taskId);
        }
        setAudioProgress(100); // Mark as complete
      })
      .catch(error => {
        console.error("Error uploading audio file:", error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload "${originalFilename}". ${error?.message || "Unknown error"}`,
          variant: "destructive"
        });
        setAudioProgress(0); // Reset progress on error
      });
    }
    e.target.value = '';
  };
  
  const handleVideoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const originalFilename = file.name;
    const purpose = e.target.getAttribute('data-purpose') || 'lip-sync';
    e.target.removeAttribute('data-purpose');

    if (purpose === 'media-player') {
      console.warn('Media player file selection - not passing identifier yet');
      // if (onMediaPlayerFileSelected) onMediaPlayerFileSelected('video', file);
      toast({
        title: "Video Loaded",
        description: `File "${originalFilename}" loaded for playback.`,
      });
    } else {
      setUploadProgress(0);
      
      // Use our enhanced uploadFile function
      uploadFile(
        getApiUrl('/upload/video'),
        file,
        (progress) => setUploadProgress(progress)
      )
      .then((response) => {
        toast({
          title: "Video File Uploaded",
          description: `File "${originalFilename}" processed for lip-sync.`,
        });

        // === IMPORTANT CHANGE: Pass GCS identifier ===
        const gcsBlobName = response?.filename;
        const taskId = response?.task_id;

        if (gcsBlobName && onFileSelected) {
          onFileSelected('video', gcsBlobName, originalFilename);
        } else {
           console.error("Upload succeeded but no GCS filename returned:", response);
           toast({ title: "Processing Error", description: "Upload succeeded but failed to get file identifier.", variant: "destructive" });
        }

        if (taskId && onTaskIdUpdate) {
          onTaskIdUpdate('uploadTask', taskId);
        }
        setUploadProgress(100);
      })
      .catch(error => {
        console.error("Error uploading video file:", error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload "${originalFilename}". ${error?.message || "Unknown error"}`,
          variant: "destructive"
        });
        setUploadProgress(0);
      });
    }
    e.target.value = '';
  };
  
  // Handler for TTS toggle
  const handleTTSToggle = () => {
    const newState = !showTTS;
    setShowTTS(newState);
    onTTSToggle(); // Pass the event up to parent
  };

  const startVoiceTraining = async () => {
    if (!voiceTraining.modelName) {
      toast({
        title: "Model Name Required",
        description: "Please enter a name for your voice model.",
        variant: "destructive"
      });
      return;
    }
    
    if (!voiceTrainingFilesRef.current?.files || voiceTrainingFilesRef.current.files.length === 0) {
      toast({
        title: "Training Files Required",
        description: "Please select audio files for voice training.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create a FormData object to send the files and training parameters
      const formData = new FormData();
      formData.append("model_name", voiceTraining.modelName);
      formData.append("epochs", voiceTraining.epochs.toString());
      formData.append("batch_size", voiceTraining.batchSize.toString());
      formData.append("sample_rate", voiceTraining.sampleRate.toString());
      formData.append("rvc_version", voiceTraining.rvcVersion);
      
      // Add all selected files to the formData
      Array.from(voiceTrainingFilesRef.current.files).forEach((file) => {
        formData.append("training_files", file);
      });
      
      // Use the new API method
      const response = await voice.train(formData);
      
      toast({
        title: "Voice Training Started",
        description: `Training job for "${voiceTraining.modelName}" has been initiated. This may take several hours.`,
      });
      
      setShowTrainVoiceDialog(false);
      
      // Optionally call the prop if parent component needs to know
      if (onTrainVoiceRequest) {
        onTrainVoiceRequest();
      }
    } catch (error) {
      console.error("Error starting voice training:", error);
      toast({
        title: "Training Error",
        description: "Failed to start voice training.",
        variant: "destructive"
      });
    }
  };

  // Handler for changing lipsync engine
  const handleEngineChange = (engine: 'wav2lip' | 'sadtalker') => {
    updateLipsyncSettings({ algorithm: engine });
    changeEngine(engine as EngineType);
    
    toast({
      title: "Lipsync Engine Changed",
      description: `Switched to ${engine.charAt(0).toUpperCase() + engine.slice(1)} lipsync engine.`,
    });
  };

  return (
    <>
      <header className="fixed top-0 w-full border-b border-purple-500 bg-[#7C3AED] backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-2">
            <CloudCog className="h-8 w-8 mr-2 text-white" />
            <span className="text-xl font-semibold text-white">CloneSync</span>
          </div>

          {/* Center Navigation */}
          <div className="flex-1 flex justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Media Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-white bg-purple-800/50 hover:bg-purple-800/70 border border-purple-300/30">
                    <Film className="h-5 w-5 mr-2 fill-none text-white stroke-white" />
                    <span className="text-white font-medium">Media</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-slate-800 text-white border border-slate-700 shadow-lg z-50" data-bs-theme="dark">
                    <div className="w-[280px] p-4">
                      <h3 className="mb-2 text-lg font-medium text-white">Open Media Files</h3>
                      <div className="grid grid-cols-1 gap-3">
                        <div onClick={handleOpenVideoFile} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-700 text-white">
                          <Video className="h-5 w-5 text-purple-300" />
                          <div>
                            <div className="text-sm font-medium text-white">Open Video</div>
                            <div className="text-xs text-gray-300">Load a video file for playback</div>
                          </div>
                        </div>
                        <div onClick={handleOpenAudioFile} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-700 text-white">
                          <Music className="h-5 w-5 text-purple-300" />
                          <div>
                            <div className="text-sm font-medium text-white">Open Audio</div>
                            <div className="text-xs text-gray-300">Load an audio file for playback</div>
                          </div>
                        </div>
                        {/* Divider */}
                        <div className="my-1 border-t border-slate-700"></div>
                        {/* Info */}
                        <div className="text-xs text-slate-400 p-2">
                          Files loaded here will be available for playback in the media player without being processed for lip-syncing.
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                {/* Lipsync Engines Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-white bg-purple-800/50 hover:bg-purple-800/70 border border-purple-300/30">
                    <Layers className="h-5 w-5 mr-2 fill-none text-white stroke-white" />
                    <span className="text-white font-medium">Lipsync Engines</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-slate-800 text-white border border-slate-700 shadow-lg z-50" data-bs-theme="dark">
                    <div className="w-[320px] p-4">
                      <h3 className="mb-2 text-lg font-medium text-white flex items-center justify-between">
                        Select Lipsync Engine
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.keys(LIPSYNC_ENGINES).map((engineId) => (
                          <EngineInfoCard
                            key={engineId}
                            engineId={engineId as EngineType}
                            isSelected={lipsyncSettings.algorithm === engineId}
                            onClick={() => handleEngineChange(engineId as EngineType)}
                            showDetails={false}
                          />
                        ))}
                      </div>
                      
                      {/* Divider */}
                      <div className="my-1 border-t border-slate-700"></div>
                      
                      {/* Engine Status */}
                      <div className="text-xs text-slate-400 p-2">
                        Current Engine: <span className="text-purple-300 font-semibold">{formatEngineName(lipsyncSettings.algorithm)}</span>
                        <br />
                        Status: {isEngineReady ? (
                          <span className="text-green-400">Ready</span>
                        ) : (
                          <span className="text-yellow-400">Loading...</span>
                        )}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                {/* Settings Menu */}
                 <NavigationMenuItem>
                   <NavigationMenuTrigger onClick={handleSettingsClick} className="text-white bg-purple-800/50 hover:bg-purple-800/70 border border-purple-300/30">
                     <Settings className="h-5 w-5 mr-2 fill-none text-white stroke-white" />
                     <span className="text-white font-medium">Settings</span>
                   </NavigationMenuTrigger>
                   <NavigationMenuContent className="bg-slate-800 text-white border border-slate-700 shadow-lg z-50" data-bs-theme="dark">
                     <div className="w-[400px] p-4">
                       <h3 className="mb-2 text-lg font-medium text-white">Advanced Lipsync Settings</h3>
                       <div className="grid grid-cols-2 gap-3">
                         <div onClick={handleLipsyncQuality} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-700 text-white">
                           <Sliders className="h-5 w-5 text-purple-300" />
                           <div>
                             <div className="text-sm font-medium text-white">Quality Settings</div>
                             <div className="text-xs text-gray-300">Adjust quality and performance</div>
                           </div>
                         </div>
                         <div onClick={handleLipsyncAlgorithm} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-700 text-white">
                           <Video className="h-5 w-5 text-purple-300" />
                           <div>
                             <div className="text-sm font-medium text-white">Lipsync Algorithm</div>
                             <div className="text-xs text-gray-300">Choose Wav2Lip, SadTalker, or GeneFace</div>
                           </div>
                         </div>
                         <div onClick={handleBeatAnalysis} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-700 text-white">
                           <BarChart2 className="h-5 w-5 text-purple-300" />
                           <div>
                             <div className="text-sm font-medium text-white">Beat Analysis</div>
                             <div className="text-xs text-gray-300">Sync speech to audio beats</div>
                           </div>
                         </div>
                         <div onClick={handleFaceDetection} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-700 text-white">
                           <FolderOpen className="h-5 w-5 text-purple-300" />
                           <div>
                             <div className="text-sm font-medium text-white">Face Detection</div>
                             <div className="text-xs text-gray-300">Tune face detection settings</div>
                           </div>
                         </div>
                         
                         {/* Engine-specific settings */}
                         {lipsyncSettings.algorithm === 'sadtalker' && (
                           <div onClick={() => setShowSadTalkerDialog(true)} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-700 text-white ml-4 border-l-2 border-purple-500">
                             <MonitorPlay className="h-5 w-5 text-purple-300" />
                             <div>
                               <div className="text-sm font-medium text-white">SadTalker Options</div>
                               <div className="text-xs text-gray-300">Advanced 3D face controls</div>
                             </div>
                           </div>
                         )}
                         
                         {/* Train Voice option directly under Face Detection */}
                         <div onClick={handleTrainVoice} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-700 text-white ml-4 border-l-2 border-purple-300">
                           <Mic className="h-5 w-5 text-purple-300" />
                           <div>
                             <div className="text-sm font-medium text-white">Train Voice</div>
                             <div className="text-xs text-gray-300">Create custom voice models</div>
                           </div>
                         </div>

                         <div onClick={handleLyricAlignment} className="cursor-pointer flex items-center space-x-2 rounded-md p-2 hover:bg-slate-700 text-white">
                           <Waves className="h-5 w-5 text-purple-300" />
                           <div>
                             <div className="text-sm font-medium text-white">Lyric Alignment</div>
                             <div className="text-xs text-gray-300">Fine-tune word synchronization</div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </NavigationMenuContent>
                 </NavigationMenuItem>
                 
                 <NavigationMenuItem>
                   <NavigationMenuTrigger onClick={handleTTSToggle} className={showTTS ? "bg-purple-800 text-white" : "text-white bg-purple-800/30 hover:bg-purple-800/50"}
                   >
                     <MessageSquareText className="h-5 w-5 mr-2 fill-none text-white stroke-white" />
                     <span className="text-white">TTS</span>
                   </NavigationMenuTrigger>
                 </NavigationMenuItem>
                 
                 {/* New Train Voice Button */}
                 <NavigationMenuItem>
                   <NavigationMenuTrigger onClick={handleTrainVoice} className="text-white bg-purple-800/30 hover:bg-purple-800/50">
                     <Mic className="h-5 w-5 mr-2 fill-none text-white stroke-white" />
                     <span className="text-white">Train Voice</span>
                   </NavigationMenuTrigger>
                   <NavigationMenuContent className="bg-slate-800 text-white border border-slate-700 shadow-lg z-50" data-bs-theme="dark">
                     <div className="w-[280px] p-4">
                       <h3 className="mb-2 text-lg font-medium text-white">Quick Voice Training</h3>
                       <div className="space-y-3 text-white">
                         <div>
                           <Label htmlFor="dropdown-voice-model-name" className="block mb-1 text-sm font-medium text-white">
                             Voice Model Name
                           </Label>
                           <input 
                             type="text" 
                             id="dropdown-voice-model-name"
                             value={voiceTraining.modelName}
                             onChange={(e) => setVoiceTraining({...voiceTraining, modelName: e.target.value})}
                             className="w-full rounded-md border border-slate-600 p-2 mt-1 bg-slate-700 text-white"
                             placeholder="MyCustomVoice" 
                           />
                         </div>
                         
                         <div>
                           <Label htmlFor="voice-model-type" className="text-white">Voice Model Type</Label>
                           <select
                             id="voice-model-type"
                             className="w-full rounded-md border border-slate-600 p-2 mt-1 bg-slate-700 text-white"
                           >
                             <option value="rvc">RVC (All Engines)</option>
                             <option value="wav2lip_compatible">Wav2Lip Compatible</option>
                             <option value="sadtalker_compatible">SadTalker Compatible</option>
                             <option value="geneface_compatible">GeneFace Compatible</option>
                           </select>
                           <p className="text-xs text-gray-300 mt-1">RVC works with all lip sync engines</p>
                         </div>
                         
                         <div>
                           <Label htmlFor="voice-rvc-version" className="text-white">RVC Version</Label>
                           <select 
                             id="voice-rvc-version"
                             value={voiceTraining.rvcVersion}
                             onChange={(e) => setVoiceTraining({...voiceTraining, rvcVersion: e.target.value})}
                             className="w-full rounded-md border border-slate-600 p-2 mt-1 bg-slate-700 text-white"
                           >
                             <option value="v1">v1</option>
                             <option value="v2">v2 (Recommended)</option>
                           </select>
                         </div>
                         
                         <div>
                           <Label htmlFor="voice-epochs">Training Epochs</Label>
                           <input 
                             type="number" 
                             id="voice-epochs"
                             value={voiceTraining.epochs}
                             onChange={(e) => setVoiceTraining({...voiceTraining, epochs: parseInt(e.target.value)})}
                             className="w-full rounded-md border border-slate-600 p-2 mt-1 bg-slate-700 text-white"
                             min={50}
                             max={1000}
                           />
                           <p className="text-xs text-gray-300 mt-1">Recommended: 200+ for best quality</p>
                         </div>
                         
                         <div>
                           <Label htmlFor="voice-batch-size">Batch Size</Label>
                           <input 
                             type="number" 
                             id="voice-batch-size"
                             value={voiceTraining.batchSize}
                             onChange={(e) => setVoiceTraining({...voiceTraining, batchSize: parseInt(e.target.value)})}
                             className="w-full rounded-md border border-slate-600 p-2 mt-1 bg-slate-700 text-white"
                             min={1}
                             max={16}
                           />
                           <p className="text-xs text-gray-300 mt-1">Lower for less GPU memory</p>
                         </div>
                         
                         <div>
                           <Label htmlFor="voice-sample-rate">Sample Rate</Label>
                           <select 
                             id="voice-sample-rate"
                             value={voiceTraining.sampleRate}
                             onChange={(e) => setVoiceTraining({...voiceTraining, sampleRate: parseInt(e.target.value)})}
                             className="w-full rounded-md border border-slate-600 p-2 mt-1 bg-slate-700 text-white"
                           >
                             <option value={32000}>32 kHz</option>
                             <option value={40000}>40 kHz (Recommended)</option>
                             <option value={48000}>48 kHz</option>
                           </select>
                         </div>
                         
                         <div className="col-span-2">
                           <Label htmlFor="voice-training-files">Training Audio Files</Label>
                           <div className="mt-1 flex gap-2">
                             <Button 
                               variant="outline" 
                               onClick={() => voiceTrainingFilesRef.current?.click()}
                               className="w-full"
                             >
                               Select Audio Files
                             </Button>
                           </div>
                           <p className="text-xs text-gray-300 mt-1">
                             Select 10+ minutes of clean voice recordings. More training data results in better quality.
                           </p>
                         </div>
                       </div>
                     </div>
                     
                     <DialogFooter>
                       <Button variant="outline" onClick={() => setShowTrainVoiceDialog(false)}>Cancel</Button>
                       <Button onClick={startVoiceTraining}>Start Training</Button>
                     </DialogFooter>
                   </NavigationMenuContent>
                 </NavigationMenuItem>
               </NavigationMenuList>
             </NavigationMenu>
          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-4">
             {/* == Add the indicator here == */}
             <EngineStatusIndicator status={engineStatus} />
             {/* Add other right-side icons/buttons after the indicator */}
             {/* Example: 
             <Button variant="ghost" size="icon" className="text-white">
               <Settings className="h-5 w-5" />
             </Button>
             */}
          </div>

        </div>
      </header>
      
      {/* Quality Settings Dialog */}
      <Dialog open={showLipsyncQualityDialog} onOpenChange={setShowLipsyncQualityDialog}>
        <DialogContent className="sm:max-w-[425px]" data-bs-theme="dark">
          <DialogHeader>
            <DialogTitle>Lipsync Quality Settings</DialogTitle>
            <DialogDescription>
              Adjust the quality settings for the lipsync algorithm.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="quality-slider">Quality: {lipsyncSettings.quality}</Label>
            <Slider 
              id="quality-slider"
              min={0} 
              max={100} 
              step={1}
              defaultValue={[lipsyncSettings.quality]}
              onValueChange={(values) => {
                updateLipsyncSettings({quality: values[0]});
              }}
            />
            <p className="text-xs text-muted-foreground">
              Lower values decrease processing time but also reduce quality.
              Higher values increase quality but may slow down processing.
            </p>
          </div>
          
          <DialogFooter>
            <Button onClick={() => {
              updateLipsyncSettings({quality: lipsyncSettings.quality});
              setShowLipsyncQualityDialog(false);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Algorithm Selection Dialog */}
      <Dialog open={showLipsyncAlgorithmDialog} onOpenChange={setShowLipsyncAlgorithmDialog}>
        <DialogContent className="sm:max-w-[425px]" data-bs-theme="dark">
          <DialogHeader>
            <DialogTitle>Lipsync Algorithm</DialogTitle>
            <DialogDescription>
              Select the algorithm used for lipsyncing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup
              value={lipsyncSettings.algorithm}
              onValueChange={(value) => {
                const algorithm = value as 'wav2lip' | 'sadtalker';
                updateLipsyncSettings({ algorithm });
              }}
              className="space-y-2"
            >
              <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-slate-700 text-white">
                <RadioGroupItem value="wav2lip" id="algorithm-wav2lip" />
                <div>
                  <Label htmlFor="algorithm-wav2lip" className="text-sm font-medium text-white">Wav2Lip</Label>
                  <p className="text-xs text-gray-300">Standard lip sync with good quality</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-slate-700 text-white">
                <RadioGroupItem value="sadtalker" id="algorithm-sadtalker" />
                <div>
                  <Label htmlFor="algorithm-sadtalker" className="text-sm font-medium text-white">SadTalker</Label>
                  <p className="text-xs text-gray-300">More expressive facial animations</p>
                </div>
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
        <DialogContent className="sm:max-w-[425px]" data-bs-theme="dark">
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
                  updateLipsyncSettings({useBeatAnalysis: checked});
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
        <DialogContent className="sm:max-w-[425px]" data-bs-theme="dark">
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
                  updateLipsyncSettings({faceDetectionThreshold: values[0]});
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
        <DialogContent className="sm:max-w-[425px]" data-bs-theme="dark">
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
                  updateLipsyncSettings({useLyricAlignment: checked});
                }}
              />
              <Label htmlFor="lyric-alignment">Enable Lyric Alignment</Label>
            </div>
            <p className="text-xs text-slate-500 mt-2">
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

      {/* SadTalker Settings Dialog */}
      <Dialog open={showSadTalkerDialog} onOpenChange={setShowSadTalkerDialog}>
        <DialogContent className="sm:max-w-[550px]" data-bs-theme="dark">
          <DialogHeader>
            <DialogTitle>SadTalker Advanced Settings</DialogTitle>
            <DialogDescription>
              Configure 3D-aware talking head animation settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Embed the SadTalker panel directly in the dialog */}
            <SadTalkerPanel />
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowSadTalkerDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Train Voice Dialog */}
      <Dialog open={showTrainVoiceDialog} onOpenChange={setShowTrainVoiceDialog}>
        <DialogContent className="sm:max-w-[500px]" data-bs-theme="dark">
          <DialogHeader>
            <DialogTitle>Train Custom Voice Model</DialogTitle>
            <DialogDescription>
              Create a new voice model for voice cloning. You'll need 10+ minutes of clean voice recordings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="voice-model-name">Model Name</Label>
                <input 
                  type="text" 
                  id="voice-model-name"
                  value={voiceTraining.modelName}
                  onChange={(e) => setVoiceTraining({...voiceTraining, modelName: e.target.value})}
                  className="w-full rounded-md border border-slate-300 p-2 mt-1"
                  placeholder="MyCustomVoice" 
                />
              </div>
              
              <div>
                <Label htmlFor="voice-model-type">Voice Model Type</Label>
                <select
                  id="voice-model-type"
                  className="w-full rounded-md border border-slate-300 p-2 mt-1"
                >
                  <option value="rvc">RVC (All Engines)</option>
                  <option value="wav2lip_compatible">Wav2Lip Compatible</option>
                  <option value="sadtalker_compatible">SadTalker Compatible</option>
                  <option value="geneface_compatible">GeneFace Compatible</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">RVC works with all lip sync engines</p>
              </div>
              
              <div>
                <Label htmlFor="voice-rvc-version">RVC Version</Label>
                <select 
                  id="voice-rvc-version"
                  value={voiceTraining.rvcVersion}
                  onChange={(e) => setVoiceTraining({...voiceTraining, rvcVersion: e.target.value})}
                  className="w-full rounded-md border border-slate-300 p-2 mt-1"
                >
                  <option value="v1">v1</option>
                  <option value="v2">v2 (Recommended)</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="voice-epochs">Training Epochs</Label>
                <input 
                  type="number" 
                  id="voice-epochs"
                  value={voiceTraining.epochs}
                  onChange={(e) => setVoiceTraining({...voiceTraining, epochs: parseInt(e.target.value)})}
                  className="w-full rounded-md border border-slate-300 p-2 mt-1"
                  min={50}
                  max={1000}
                />
                <p className="text-xs text-slate-500 mt-1">Recommended: 200+ for best quality</p>
              </div>
              
              <div>
                <Label htmlFor="voice-batch-size">Batch Size</Label>
                <input 
                  type="number" 
                  id="voice-batch-size"
                  value={voiceTraining.batchSize}
                  onChange={(e) => setVoiceTraining({...voiceTraining, batchSize: parseInt(e.target.value)})}
                  className="w-full rounded-md border border-slate-300 p-2 mt-1"
                  min={1}
                  max={16}
                />
                <p className="text-xs text-slate-500 mt-1">Lower for less GPU memory</p>
              </div>
              
              <div>
                <Label htmlFor="voice-sample-rate">Sample Rate</Label>
                <select 
                  id="voice-sample-rate"
                  value={voiceTraining.sampleRate}
                  onChange={(e) => setVoiceTraining({...voiceTraining, sampleRate: parseInt(e.target.value)})}
                  className="w-full rounded-md border border-slate-300 p-2 mt-1"
                >
                  <option value={32000}>32 kHz</option>
                  <option value={40000}>40 kHz (Recommended)</option>
                  <option value={48000}>48 kHz</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="voice-training-files">Training Audio Files</Label>
                <div className="mt-1 flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => voiceTrainingFilesRef.current?.click()}
                    className="w-full"
                  >
                    Select Audio Files
                  </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                  Select 10+ minutes of clean voice recordings. More training data results in better quality.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrainVoiceDialog(false)}>Cancel</Button>
            <Button onClick={startVoiceTraining}>Start Training</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* GeneFace Settings Dialog */}
      <Dialog open={showGeneFaceDialog} onOpenChange={setShowGeneFaceDialog}>
        <DialogContent className="sm:max-w-[550px]" data-bs-theme="dark">
          <DialogHeader>
            <DialogTitle>GeneFace Advanced Settings</DialogTitle>
            <DialogDescription>
              Configure neural rendering settings for GeneFace.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Embed the GeneFace panel directly in the dialog */}
            <GeneFacePanel />
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowGeneFaceDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={audioInputRef}
        style={{ display: 'none' }}
        onChange={handleAudioFileSelected}
        accept="audio/*"
      />
      <input
        type="file"
        ref={videoInputRef}
        style={{ display: 'none' }}
        onChange={handleVideoFileSelected}
        accept="video/*"
      />
      <input
        type="file"
        ref={voiceTrainingFilesRef}
        style={{ display: 'none' }}
        onChange={handleVoiceTrainingFilesSelected}
        accept="audio/*"
        multiple
      />
    </>
  );
};

export default Header;