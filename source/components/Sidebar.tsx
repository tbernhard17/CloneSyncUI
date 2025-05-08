import React, { useState, useRef, useEffect } from "react";
import { Upload, Headphones, Mic, Edit, Download, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { useSettings } from '../context/SettingsContext';
import type { LipsyncSettings } from '../context/SettingsContext';
import { getApiUrl, apiRequest, lipSync } from '../utils/apiUtils';
import { uploadFile, pollTaskStatus, getDownloadUrl } from '../utils/api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Function types for our button actions
type ButtonAction = () => void;

interface SidebarButtonProps {
  icon: React.ComponentType<any>;
  label: string;
  onClick: ButtonAction;
  progress?: number; // Progress value between 0-100
  disabled?: boolean;
  className?: string;
  tooltipContent?: React.ReactNode; // Add tooltip content prop
}

interface SidebarProps {
  onEditScript: () => void;
  videoFileIdentifier: string | null;
  audioFileIdentifier: string | null;
  videoOriginalName?: string | null; // Keep original name for display/tooltip
  audioOriginalName?: string | null;
  currentVoiceModel: string | null;
  taskIds?: {
    uploadTask: string | null;
    voiceTask: string | null;
    audioTask: string | null;
    lipSyncTask: string | null;
  };
  onTaskIdUpdate?: (type: 'uploadTask' | 'audioTask' | 'voiceTask' | 'lipSyncTask', id: string) => void;
  onFileSelected?: (fileType: 'audio' | 'video' | 'voice', identifier: string, originalFilename?: string) => void;
}

// Define the expected structure for the API payload options
interface Wav2LipPayloadOptions {
  pads?: number[];
  resize_factor?: number;
  nosmooth?: boolean;
  batch_size?: number;
  use_enhancer?: boolean;
  use_background_enhancer?: boolean;
  preprocess_mode?: string;
  mask_dilate?: number;
  mask_blur?: number;
  enable_face_swap?: boolean;
  face_swap_image?: string;
  zero_mouth?: boolean;
  show_frame_number?: boolean;
  volume_amplification?: number;
  delay_start_time?: number;
  enable_keyframe_manager?: boolean;
  auto_mask?: boolean;
  driving_video?: boolean;
  driving_avatar?: string;
  enable_comfy_ui?: boolean;
}

interface SadTalkerPayloadOptions {
  still_mode?: boolean;
  use_enhancer?: boolean;
  preprocess_mode?: string;
  pose_style?: number;
  batch_size?: number;
  expression_scale?: number;
  ref_eyeblink?: string;
  ref_pose?: string;
  face3d_vis?: boolean;
  input_yaw?: number[];
  input_pitch?: number[];
  input_roll?: number[];
}

interface GeneFacePayloadOptions {
  quality?: string;
  frame_rate?: number;
  use_high_quality_mode?: boolean;
  neural_model_type?: string;
  expression_intensity?: number;
  enable_post_processing?: boolean;
  preserve_background?: boolean;
  enable_super_resolution?: boolean;
  upscale_factor?: number;
  gpu_acceleration?: string;
  precision?: string;
  enable_audio_preprocessing?: boolean;
  enable_audio_normalization?: boolean;
  audio_sample_rate?: number;
}

interface ApiOptionsPayload {
  wav2lip?: Wav2LipPayloadOptions;
  sadtalker?: SadTalkerPayloadOptions;
  geneface?: GeneFacePayloadOptions;
}

const Sidebar = ({
  onEditScript,
  videoFileIdentifier,
  audioFileIdentifier,
  videoOriginalName,
  audioOriginalName,
  currentVoiceModel,
  taskIds: parentTaskIds,
  onTaskIdUpdate,
  onFileSelected
}: SidebarProps) => {
  const { lipsyncSettings }: { lipsyncSettings: LipsyncSettings } = useSettings();

  // State for tracking progress of different tasks
  const [uploadProgress, setUploadProgress] = useState(0);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [lipSyncProgress, setLipSyncProgress] = useState(0);
  const [scriptProgress, setScriptProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Use local task IDs or parent task IDs if available
  const [localTaskIds, setLocalTaskIds] = useState({
    uploadTask: null,
    voiceTask: null,
    audioTask: null,
    lipSyncTask: null
  });
  
  // Actual task IDs to use (from props if available, otherwise from local state)
  const taskIds = parentTaskIds || localTaskIds;
  
  // Function to update task IDs in both local state and parent
  const updateTaskId = (type: 'uploadTask' | 'audioTask' | 'voiceTask' | 'lipSyncTask', id: string) => {
    // Update local state
    setLocalTaskIds(prev => ({ ...prev, [type]: id }));
    
    // Notify parent if callback provided
    if (onTaskIdUpdate) {
      onTaskIdUpdate(type, id);
    }
  };

  // References for file inputs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const voiceModelInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Handler functions for each button
  const handleUploadVideo = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const handleVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(0);
    
    try {
      // Use our enhanced uploadFile function with getApiUrl to handle RunPod in production
      const response = await uploadFile(
        getApiUrl("/api/v1/upload/video"),
        file,
        (progress) => setUploadProgress(progress)
      );
      
      if (response.task_id) {
        // Update task IDs
        updateTaskId('uploadTask', response.task_id);
        
        // Start polling for task status
        pollTaskStatus(
          response.task_id,
          (progress) => setUploadProgress(progress)
        ).then((result) => {
          toast({
            title: "Upload Complete",
            description: "Video upload and processing completed successfully.",
          });
          
          // Call parent's onFileSelected if available with the GCS identifier from result
          if (onFileSelected && result?.data?.filename) {
            onFileSelected('video', result.data.filename, file.name);
          }
        }).catch((error) => {
          console.error("Task polling error:", error);
          // Error already handled by the pollTaskStatus function
        });
      }
    } catch (error) {
      // Error already handled by the uploadFile function
      console.error("Upload error:", error);
    }
  };

  const handleUploadVoiceModel = () => {
    if (voiceModelInputRef.current) {
      voiceModelInputRef.current.click();
    }
  };

  const handleVoiceModelSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVoiceProgress(0);
    
    try {
      // Use enhanced uploadFile function with getApiUrl to handle RunPod in production
      const response = await uploadFile(
        getApiUrl("/api/v1/upload/voice"),
        file,
        (progress) => setVoiceProgress(progress)
      );
      
      if (response.task_id) {
        updateTaskId('voiceTask', response.task_id);
        
        pollTaskStatus(
          response.task_id,
          (progress) => setVoiceProgress(progress)
        ).then((result) => {
          toast({
            title: "Voice Model Ready",
            description: "Voice model was uploaded and processed successfully.",
          });
          
          // Call parent's onFileSelected with the GCS identifier if available
          if (onFileSelected && result?.data?.filename) {
            onFileSelected('voice', result.data.filename, file.name);
          }
        }).catch((error) => {
          console.error("Voice model task error:", error);
        });
      }
    } catch (error) {
      console.error("Voice model upload error:", error);
    }
  };

  const handleUploadAudio = () => {
    if (audioInputRef.current) {
      audioInputRef.current.click();
    }
  };

  const handleAudioFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioProgress(0);
    
    try {
      const response = await uploadFile(
        getApiUrl("/api/v1/upload/audio"),
        file,
        (progress) => setAudioProgress(progress)
      );
      
      if (response.task_id) {
        updateTaskId('audioTask', response.task_id);
        
        pollTaskStatus(
          response.task_id,
          (progress) => setAudioProgress(progress)
        ).then((result) => {
          toast({
            title: "Audio Ready",
            description: "Audio was uploaded and processed successfully.",
          });
          
          // Call parent's onFileSelected with the GCS identifier from result
          if (onFileSelected && result?.data?.filename) {
            onFileSelected('audio', result.data.filename, file.name);
          }
        }).catch((error) => {
          console.error("Audio task error:", error);
        });
      }
    } catch (error) {
      console.error("Audio upload error:", error);
    }
  };

  const handleStartLipSync = async () => {
    if (!videoFileIdentifier || !audioFileIdentifier) {
      toast({
        title: "Missing Files",
        description: "Backend identifiers for video and audio are missing. Ensure files were uploaded successfully.",
        variant: "destructive"
      });
      return;
    }

    setLipSyncProgress(0);
    setDownloadUrl(null); // Reset download URL when starting new lipsync
    
    try {
      const currentAlgorithm = lipsyncSettings.algorithm || 'wav2lip';
      const apiOptions: ApiOptionsPayload = {};

      if (currentAlgorithm === 'wav2lip') {
        const padsArray = [
            lipsyncSettings.pads.top ?? 0,
            lipsyncSettings.pads.bottom ?? 0,
            lipsyncSettings.pads.left ?? 0,
            lipsyncSettings.pads.right ?? 0
        ];
        // Ensure resize_factor is a number, defaulting to 1 if null/undefined/NaN
        const resizeFactorValue = Number.isFinite(lipsyncSettings.resizeFactor) ? lipsyncSettings.resizeFactor : 1;
        apiOptions.wav2lip = {
          pads: padsArray,
          resize_factor: resizeFactorValue,
          nosmooth: lipsyncSettings.nosmooth,
          batch_size: Number.isFinite(lipsyncSettings.batchSize) ? lipsyncSettings.batchSize : undefined,
          volume_amplification: Number.isFinite(lipsyncSettings.volumeAmplification) ? lipsyncSettings.volumeAmplification : undefined,
          delay_start_time: Number.isFinite(lipsyncSettings.delayStartTime) ? lipsyncSettings.delayStartTime : undefined,
          mask_dilate: Number.isFinite(lipsyncSettings.maskDilate) ? lipsyncSettings.maskDilate : undefined,
          mask_blur: Number.isFinite(lipsyncSettings.maskBlur) ? lipsyncSettings.maskBlur : undefined,
          use_enhancer: lipsyncSettings.useEnhancer,
          use_background_enhancer: lipsyncSettings.useBackgroundEnhancer,
          preprocess_mode: lipsyncSettings.preprocessMode,
          enable_face_swap: lipsyncSettings.enableFaceSwap,
          face_swap_image: lipsyncSettings.faceSwapImage,
          zero_mouth: lipsyncSettings.zeroMouth,
          show_frame_number: lipsyncSettings.showFrameNumber,
          enable_keyframe_manager: lipsyncSettings.enableKeyframeManager,
          auto_mask: lipsyncSettings.autoMask,
          driving_video: lipsyncSettings.drivingVideo,
          driving_avatar: lipsyncSettings.drivingAvatar,
          enable_comfy_ui: lipsyncSettings.enableComfyUI,
        };
      } else if (currentAlgorithm === 'sadtalker') {
         // Ensure numbers are numbers
         apiOptions.sadtalker = {
           still_mode: lipsyncSettings.stillMode,
           use_enhancer: lipsyncSettings.useEnhancer,
           preprocess_mode: lipsyncSettings.preprocessMode,
           pose_style: Number.isFinite(lipsyncSettings.poseStyle) ? lipsyncSettings.poseStyle : 0,
           batch_size: Number.isFinite(lipsyncSettings.batchSize) ? lipsyncSettings.batchSize : 2,
           expression_scale: Number.isFinite(lipsyncSettings.expressionScale) ? lipsyncSettings.expressionScale : 1.0,
           ref_eyeblink: lipsyncSettings.refEyeblink,
           ref_pose: lipsyncSettings.refPose,
           face3d_vis: lipsyncSettings.face3dVis,
           input_yaw: lipsyncSettings.inputYaw,
           input_pitch: lipsyncSettings.inputPitch,
           input_roll: lipsyncSettings.inputRoll,
         };
      } else if (currentAlgorithm === 'geneface') {
         // Ensure numbers are numbers
         apiOptions.geneface = {
            quality: lipsyncSettings.quality?.toString(), // Convert to string to fix type error
            frame_rate: Number.isFinite(lipsyncSettings.frameRate) ? lipsyncSettings.frameRate : undefined,
            expression_intensity: Number.isFinite(lipsyncSettings.expressionIntensity) ? lipsyncSettings.expressionIntensity : undefined,
            upscale_factor: Number.isFinite(lipsyncSettings.upscaleFactor) ? lipsyncSettings.upscaleFactor : undefined,
            audio_sample_rate: Number.isFinite(lipsyncSettings.audioSampleRate) ? lipsyncSettings.audioSampleRate : undefined,
            use_high_quality_mode: lipsyncSettings.useHighQualityMode,
            neural_model_type: lipsyncSettings.neuralModelType,
            enable_post_processing: lipsyncSettings.enablePostProcessing,
            preserve_background: lipsyncSettings.preserveBackground,
            enable_super_resolution: lipsyncSettings.enableSuperResolution,
            gpu_acceleration: lipsyncSettings.gpuAcceleration,
            precision: lipsyncSettings.precision,
            enable_audio_preprocessing: lipsyncSettings.enableAudioPreprocessing,
            enable_audio_normalization: lipsyncSettings.enableAudioNormalization,
         };
      }

      const payload = {
          engine: currentAlgorithm,
          audio_blob_name: audioFileIdentifier,
          face_blob_name: videoFileIdentifier,
          options: apiOptions
      };

      // Helper function to get download URL from task
      const getDownloadUrl = async (taskId: string): Promise<string | null> => {
        try {
          // Check if task results contain a download URL
          const response = await pollTaskStatus(taskId, () => {});
          if (response && response.data && response.data.output_url) {
            return response.data.output_url;
          }
          return null;
        } catch (error) {
          console.error("Error getting download URL:", error);
          return null;
        }
      };

      console.log("Starting lip sync with payload:", payload);
      const response = await lipSync.start(payload);

      if (response && response.task_id) {
        updateTaskId('lipSyncTask', response.task_id);
        toast({
          title: "Lip Sync Started",
          description: `Task ${response.task_id} initiated for ${payload.engine}.`,
        });
        
        // Start polling for lip sync progress
        pollTaskStatus(
          response.task_id,
          (progress) => setLipSyncProgress(progress)
        ).then((result) => {
          toast({
            title: "Lip Sync Complete",
            description: "Processing completed successfully.",
          });
          
          // If result contains download URL, enable download button functionality
          if (result?.data?.output_url) {
            setDownloadUrl(result.data.output_url);
          } else {
            // Try to fetch the download URL specifically
            getDownloadUrl(response.task_id)
              .then(url => {
                if (url) {
                  setDownloadUrl(url);
                }
              })
              .catch(error => {
                console.error("Error fetching download URL:", error);
              });
          }
        }).catch((error) => {
          console.error("Lip sync task error:", error);
          toast({
            title: "Lip Sync Failed",
            description: error instanceof Error ? error.message : "Processing failed",
            variant: "destructive"
          });
        });
      } else {
          throw new Error(response.error || "Failed to get task ID from lipsync start response");
      }

    } catch (error) {
      console.error("Error starting lip sync:", error);
      toast({
        title: "Lip Sync Failed",
        description: error instanceof Error ? error.message : 'Failed to start process',
        variant: "destructive"
      });
      setLipSyncProgress(0);
    }
  };

  const handleEditScript = () => {
    if (onEditScript) {
      onEditScript();
    }
  };

  const handleDownloadResult = () => {
    if (downloadUrl) {
      // Open the download URL in a new tab
      window.open(downloadUrl, '_blank');
    } else if (taskIds.lipSyncTask) {
      // If we have a task ID but no URL yet, try to fetch it
      toast({
        title: "Fetching Download Link",
        description: "Trying to retrieve the download URL...",
      });
      
      // Helper function to get download URL from task
      const getDownloadUrl = async (taskId: string): Promise<string | null> => {
        try {
          // Check if task results contain a download URL
          const response = await pollTaskStatus(taskId, () => {});
          if (response && response.data && response.data.output_url) {
            return response.data.output_url;
          }
          return null;
        } catch (error) {
          console.error("Error getting download URL:", error);
          return null;
        }
      };
      
      // Try to fetch the download URL
      getDownloadUrl(taskIds.lipSyncTask)
        .then(url => {
          if (url) {
            setDownloadUrl(url);
            window.open(url, '_blank');
          } else {
            toast({
              title: "Download Not Available",
              description: "The download URL is not available yet. The processing may still be in progress.",
              variant: "destructive"
            });
          }
        })
        .catch(error => {
          console.error("Error fetching download URL:", error);
          toast({
            title: "Download Error",
            description: "Failed to retrieve the download URL.",
            variant: "destructive"
          });
        });
    } else {
      toast({
        title: "No Download Available",
        description: "No completed lipsync task found to download.",
        variant: "destructive"
      });
    }
  };

  // Common component for sidebar buttons with progress
  const SidebarButton: React.FC<SidebarButtonProps> = ({ 
    icon: Icon, 
    label, 
    onClick, 
    progress, 
    disabled, 
    className, 
    tooltipContent
  }) => {
    const buttonContent = (
      <Button 
        onClick={onClick} 
        className={`w-full flex gap-2 items-center justify-start bg-gray-800 hover:bg-gray-700 text-white border-gray-700 ${className || ''}`}
        disabled={disabled}
        variant="outline"
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </Button>
    );

    return (
      <div className="w-full flex flex-col gap-2 mb-4">
        {tooltipContent ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {buttonContent}
            </TooltipTrigger>
            <TooltipContent>
              {tooltipContent}
            </TooltipContent>
          </Tooltip>
        ) : (
          buttonContent
        )}
        <div className="w-full bg-gray-800 rounded-full h-4 border border-purple-300/30">
          <div 
            className={`h-full rounded-full ${progress && progress > 0 ? 'bg-purple-600' : 'bg-gray-700'} transition-all`}
            style={{ width: `${progress || 0}%` }}
          >
            {progress && progress > 0 && (
              <span className="block text-xs text-white text-center font-bold leading-4">
                {Math.round(progress)}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const lipSyncTooltip = !videoFileIdentifier || !audioFileIdentifier 
      ? "Upload both a video file and an audio file to enable lip sync" 
      : `Ready to lip sync ${videoOriginalName || 'video'} with ${audioOriginalName || 'audio'}?`;

  // Update download URL to use relative URL if on same domain
  useEffect(() => {
    if (downloadUrl) {
      if (downloadUrl.startsWith('http')) {
        // If it's already an absolute URL, leave it as is
        setDownloadUrl(downloadUrl);
      } else {
        // If it's a relative path, make sure it has the correct format
        const formattedUrl = downloadUrl.startsWith('/') ? downloadUrl : `/${downloadUrl}`;
        setDownloadUrl(formattedUrl);
      }
    }
  }, [downloadUrl]);

  useEffect(() => {
    console.log("[DEBUG] Sidebar identifiers:", { videoFileIdentifier, audioFileIdentifier });
  }, [videoFileIdentifier, audioFileIdentifier]);

  return (
    <div className="w-64 bg-[#1a1a2e] border-r border-gray-800 p-4 flex flex-col h-full">
      <h2 className="text-lg font-bold mb-6 text-white">CloneSync</h2>
      
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleVideoFileSelected}
        accept="video/*"
        className="hidden"
      />
      <input
        type="file"
        ref={voiceModelInputRef}
        onChange={handleVoiceModelSelected}
        accept=".zip,.pth,audio/*"
        className="hidden"
      />
      <input
        type="file"
        ref={audioInputRef}
        onChange={handleAudioFileSelected}
        accept="audio/*"
        className="hidden"
      />
      
      {/* Buttons container with margin-top to push down from taskbar */}
      <div className="mt-12">
        {/* Buttons */}
        <SidebarButton
          icon={Upload}
          label="Upload Video"
          onClick={handleUploadVideo}
          progress={uploadProgress}
          tooltipContent="Select a video file for processing"
        />
        <SidebarButton
          icon={Mic}
          label="Upload Voice Model"
          onClick={handleUploadVoiceModel}
          progress={voiceProgress}
          tooltipContent="Upload training data or a pre-trained model (.pth/.zip)"
        />
        <SidebarButton
          icon={Headphones}
          label="Upload Audio"
          onClick={handleUploadAudio}
          progress={audioProgress}
          tooltipContent="Select an audio file for TTS or lip sync source"
        />
        <SidebarButton
          icon={Edit}
          label="Edit Script"
          onClick={handleEditScript}
          progress={scriptProgress}
          tooltipContent="Edit the text script for TTS generation"
        />
        <SidebarButton
          icon={Scissors}
          label="Start Lip Sync"
          onClick={handleStartLipSync}
          progress={lipSyncProgress}
          disabled={!videoFileIdentifier || !audioFileIdentifier}
          className={videoFileIdentifier && audioFileIdentifier ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-700" : undefined}
          tooltipContent={lipSyncTooltip}
        />
        <SidebarButton
          icon={Download}
          label="Download Result"
          onClick={handleDownloadResult}
          disabled={lipSyncProgress < 100}
          tooltipContent="Download the processed output file (available after completion)"
        />
      </div>
    </div>
  );
};

export default Sidebar;
