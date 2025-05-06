import { createContext, useContext, useState, ReactNode } from 'react';

// Define settings interfaces
export interface FacePadding {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface LipsyncSettings {
  algorithm: 'wav2lip' | 'sadtalker' | 'geneface';
  quality: number;
  useBeatAnalysis: boolean;
  faceDetectionThreshold: number;
  useLyricAlignment: boolean;
  pads: FacePadding;
  resizeFactor: number;
  nosmooth?: boolean;
  stillMode?: boolean;
  // SadTalker specific settings
  poseStyle?: number;
  batchSize?: number;
  useEnhancer?: boolean;
  preprocessMode?: 'crop' | 'resize' | 'full';
  expressionScale?: number;
  refEyeblink?: string;
  refPose?: string;
  face3dVis?: boolean;
  inputYaw?: number[];
  inputPitch?: number[];
  inputRoll?: number[];
  // GeneFace specific settings
  frameRate?: number;
  useHighQualityMode?: boolean;
  neuralModelType?: string;
  expressionIntensity?: number;
  enablePostProcessing?: boolean;
  preserveBackground?: boolean;
  enableSuperResolution?: boolean;
  upscaleFactor?: number;
  gpuAcceleration?: string;
  precision?: string;
  enableAudioPreprocessing?: boolean;
  enableAudioNormalization?: boolean;
  audioSampleRate?: number;
  audioPath?: string;
  // Wav2Lip specific settings
  useBackgroundEnhancer?: boolean; // Enhance background with super-resolution
  maskDilate?: number; // Dilate mouth mask
  maskBlur?: number; // Blur mask edges
  enableFaceSwap?: boolean; // Enable face swap feature
  faceSwapImage?: string; // Reference image for face swap
  zeroMouth?: boolean; // Close mouth before lipsync
  showFrameNumber?: boolean; // Show frame number for debugging
  volumeAmplification?: number; // Amplify audio volume
  delayStartTime?: number; // Delay speech start time
  enableKeyframeManager?: boolean; // Enable keyframe manager
  autoMask?: boolean; // Automatically calculate mask parameters
  drivingVideo?: boolean; // Use driving video feature
  drivingAvatar?: string; // Avatar for driving video
  enableComfyUI?: boolean; // Enable ComfyUI integration
}

export interface VoiceSettings {
  model: 'rvc' | 'tortoise' | 'bark';
  quality: number;
  enableTraining: boolean;
  trainingEpochs: number;
  pitchCorrection: number;
}

// Define context interface
interface SettingsContextType {
  lipsyncSettings: LipsyncSettings;
  voiceSettings: VoiceSettings;
  updateLipsyncSettings: (settings: Partial<LipsyncSettings>) => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  getLipsyncSettingsForAPI: () => any; // Returns formatted settings for API
  getVoiceSettingsForAPI: () => any; // Returns formatted voice settings for API
}

// Create context with default values
const SettingsContext = createContext<SettingsContextType>({
  lipsyncSettings: {
    algorithm: 'sadtalker',
    quality: 70,
    useBeatAnalysis: false,
    faceDetectionThreshold: 0.5,
    useLyricAlignment: false,
    pads: { top: 0, bottom: 10, left: 0, right: 0 },
    resizeFactor: 1,
    nosmooth: false,
    stillMode: false,
    // SadTalker defaults
    poseStyle: 0,
    batchSize: 2,
    useEnhancer: false,
    preprocessMode: 'crop',
    expressionScale: 1.0,
    face3dVis: false,
  },
  voiceSettings: {
    model: 'rvc',
    quality: 80,
    enableTraining: false,
    trainingEpochs: 100,
    pitchCorrection: 0,
  },
  updateLipsyncSettings: () => {},
  updateVoiceSettings: () => {},
  getLipsyncSettingsForAPI: () => ({}),
  getVoiceSettingsForAPI: () => ({}),
});

// Provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [lipsyncSettings, setLipsyncSettings] = useState<LipsyncSettings>({
    algorithm: 'sadtalker',
    quality: 70,
    useBeatAnalysis: false,
    faceDetectionThreshold: 0.5,
    useLyricAlignment: false,
    pads: { top: 0, bottom: 10, left: 0, right: 0 },
    resizeFactor: 1,
    nosmooth: false,
    stillMode: false,
    // SadTalker defaults
    poseStyle: 0,
    batchSize: 2,
    useEnhancer: false,
    preprocessMode: 'crop',
    expressionScale: 1.0,
    face3dVis: false,
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    model: 'rvc',
    quality: 80,
    enableTraining: false,
    trainingEpochs: 100,
    pitchCorrection: 0,
  });

  // Update settings with partial changes
  const updateLipsyncSettings = (newSettings: Partial<LipsyncSettings>) => {
    setLipsyncSettings(prev => ({
      ...prev,
      ...newSettings,
      pads: {
        ...prev.pads,
        ...(newSettings.pads || {})
      }
    }));
  };

  // Update voice settings with partial changes
  const updateVoiceSettings = (newSettings: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  };

  // Format settings for API calls
  const getLipsyncSettingsForAPI = () => {
    const { pads, ...rest } = lipsyncSettings;
    
    // Base settings for all engines
    const settings = {
      ...rest,
      pads: `${pads.top} ${pads.bottom} ${pads.left} ${pads.right}`,
      resize_factor: lipsyncSettings.resizeFactor,
      use_beat_analysis: lipsyncSettings.useBeatAnalysis,
      use_lyric_alignment: lipsyncSettings.useLyricAlignment,
      face_detection_threshold: lipsyncSettings.faceDetectionThreshold,
    };
    
    // Add SadTalker specific settings when that engine is selected
    if (lipsyncSettings.algorithm === 'sadtalker') {
      return {
        ...settings,
        pose_style: lipsyncSettings.poseStyle,
        batch_size: lipsyncSettings.batchSize,
        still: lipsyncSettings.stillMode,
        use_enhancer: lipsyncSettings.useEnhancer,
        preprocess_mode: lipsyncSettings.preprocessMode,
        expression_scale: lipsyncSettings.expressionScale,
        ref_eyeblink: lipsyncSettings.refEyeblink,
        ref_pose: lipsyncSettings.refPose,
        face3d_vis: lipsyncSettings.face3dVis,
        input_yaw: lipsyncSettings.inputYaw,
        input_pitch: lipsyncSettings.inputPitch,
        input_roll: lipsyncSettings.inputRoll,
      };
    }
    
    // Add GeneFace specific settings when that engine is selected
    if (lipsyncSettings.algorithm === 'geneface') {
      return {
        ...settings,
        frame_rate: lipsyncSettings.frameRate,
        use_high_quality_mode: lipsyncSettings.useHighQualityMode,
        neural_model_type: lipsyncSettings.neuralModelType,
        expression_intensity: lipsyncSettings.expressionIntensity,
        enable_post_processing: lipsyncSettings.enablePostProcessing,
        preserve_background: lipsyncSettings.preserveBackground,
        enable_super_resolution: lipsyncSettings.enableSuperResolution,
        upscale_factor: lipsyncSettings.upscaleFactor,
        gpu_acceleration: lipsyncSettings.gpuAcceleration,
        precision: lipsyncSettings.precision,
        enable_audio_preprocessing: lipsyncSettings.enableAudioPreprocessing,
        enable_audio_normalization: lipsyncSettings.enableAudioNormalization,
        audio_sample_rate: lipsyncSettings.audioSampleRate,
        audio_path: lipsyncSettings.audioPath,
      };
    }
    
    // Add Wav2Lip specific settings when that engine is selected
    if (lipsyncSettings.algorithm === 'wav2lip') {
      return {
        ...settings,
        batch_size: lipsyncSettings.batchSize,
        use_enhancer: lipsyncSettings.useEnhancer,
        use_background_enhancer: lipsyncSettings.useBackgroundEnhancer,
        preprocess_mode: lipsyncSettings.preprocessMode,
        mask_dilate: lipsyncSettings.maskDilate,
        mask_blur: lipsyncSettings.maskBlur,
        enable_face_swap: lipsyncSettings.enableFaceSwap,
        face_swap_image: lipsyncSettings.faceSwapImage,
        zero_mouth: lipsyncSettings.zeroMouth,
        show_frame_number: lipsyncSettings.showFrameNumber,
        volume_amplification: lipsyncSettings.volumeAmplification,
        delay_start_time: lipsyncSettings.delayStartTime,
        enable_keyframe_manager: lipsyncSettings.enableKeyframeManager,
        auto_mask: lipsyncSettings.autoMask,
        driving_video: lipsyncSettings.drivingVideo,
        driving_avatar: lipsyncSettings.drivingAvatar,
        enable_comfy_ui: lipsyncSettings.enableComfyUI,
        nosmooth: lipsyncSettings.nosmooth,
      };
    }
    
    // Return base settings for other engines
    return settings;
  };

  // Format voice settings for API calls
  const getVoiceSettingsForAPI = () => {
    return {
      model: voiceSettings.model,
      quality: voiceSettings.quality,
      enable_training: voiceSettings.enableTraining,
      training_epochs: voiceSettings.trainingEpochs,
      pitch_correction: voiceSettings.pitchCorrection,
    };
  };

  return (
    <SettingsContext.Provider value={{ 
      lipsyncSettings,
      voiceSettings, 
      updateLipsyncSettings,
      updateVoiceSettings,
      getLipsyncSettingsForAPI,
      getVoiceSettingsForAPI
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook for using settings
export const useSettings = () => useContext(SettingsContext);