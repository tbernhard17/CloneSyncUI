import { EngineType } from '@/context/EngineContext';

/**
 * Centralized constants and types for lipsync engines
 */

export interface EngineInfo {
  id: EngineType;
  name: string;
  description: string;
  features: string[];
  recommendedFor: string[];
}

export const LIPSYNC_ENGINES: Record<EngineType, EngineInfo> = {
  wav2lip: {
    id: 'wav2lip',
    name: 'Wav2Lip',
    description: 'Fast lipsync with good accuracy',
    features: [
      'Fast processing time',
      'Good lip synchronization',
      'Works with most face angles'
    ],
    recommendedFor: [
      'Fast iteration',
      'General purpose lip-syncing',
      'Standard talking head videos'
    ]
  },
  sadtalker: {
    id: 'sadtalker',
    name: 'SadTalker',
    description: '3D-aware talking head animation',
    features: [
      'Head pose control',
      'Natural facial expressions',
      'Still mode for fewer head movements',
      'Expression intensity adjustment',
      'Face enhancement options',
      'Multiple preprocessing modes (crop/resize/full)',
      'Reference video for eyeblinks and poses',
      '3D face visualization',
      'Free-view control (yaw/pitch/roll)'
    ],
    recommendedFor: [
      'Natural head movements',
      'Expressive face animations',
      'Creative presentations',
      'Novel view generation',
      'Full body animations'
    ]
  }
};

/**
 * Get engine info by ID
 */
export function getEngineInfo(engineId: EngineType): EngineInfo {
  return LIPSYNC_ENGINES[engineId] || LIPSYNC_ENGINES.wav2lip;
}

/**
 * Format engine name for display
 */
export function formatEngineName(engineId: EngineType): string {
  return LIPSYNC_ENGINES[engineId]?.name || engineId.charAt(0).toUpperCase() + engineId.slice(1);
}

/**
 * Get engine description
 */
export function getEngineDescription(engineId: EngineType): string {
  return LIPSYNC_ENGINES[engineId]?.description || '';
}

/**
 * Get all engines as an array
 */
export function getAllEngines(): EngineInfo[] {
  return Object.values(LIPSYNC_ENGINES);
} 