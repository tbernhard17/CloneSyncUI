import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VoiceTrainingPanel from './VoiceTrainingPanel';
import { useSettings } from '@/context/SettingsContext';

const VoiceTrainingModal = ({ open, onOpenChange }) => {
  const { voiceSettings } = useSettings();

  const handleTrainingComplete = (modelId) => {
    // You can add additional logic here when training completes
    console.log('Training completed, model ID:', modelId);
    
    // Optionally close the modal after a delay
    setTimeout(() => {
      onOpenChange(false);
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-b from-[#7E22CE]/95 to-[#1E1B4B]/95 backdrop-blur-sm border-purple-700/50 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Train Voice Model</DialogTitle>
          <DialogDescription className="text-purple-200">
            Train a new voice model using {voiceSettings.model.toUpperCase()} engine with {voiceSettings.trainingEpochs} epochs
          </DialogDescription>
        </DialogHeader>
        
        <VoiceTrainingPanel onComplete={handleTrainingComplete} />
      </DialogContent>
    </Dialog>
  );
};

export default VoiceTrainingModal;
