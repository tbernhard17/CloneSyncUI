import React, { useState, useEffect } from 'react';
import { voiceClone, settings } from '../api';
import { formatApiError } from '../utils/apiErrorHandler';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import UploadHandler from './UploadHandler';

interface VoiceTrainingPanelProps {
  onComplete?: (modelId: string) => void;
}

interface UploadedSample {
  path: string;
  filename?: string;
  id?: string;
}

interface TrainingResponse {
  success: boolean;
  data?: {
    job_id: string;
    model_id?: string;
  };
  error?: string;
}

interface TrainingStatusResponse {
  success: boolean;
  data?: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    message?: string;
    model_id?: string;
  };
  error?: string;
}

const VoiceTrainingPanel: React.FC<VoiceTrainingPanelProps> = ({ onComplete }) => {
  const { voiceSettings } = useSettings();
  const [uploadedSamples, setUploadedSamples] = useState<UploadedSample[]>([]);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'uploading' | 'training' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string>('');

  // Poll training status if we have a job ID
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (jobId && trainingStatus === 'training') {
      interval = setInterval(async () => {
        const response = await voiceClone.getTrainingStatus(jobId) as TrainingStatusResponse;
        if (response.success) {
          const { status, progress: jobProgress, message } = response.data || {};
          
          setProgress(jobProgress || 0);
          
          if (status === 'completed') {
            setTrainingStatus('complete');
            clearInterval(interval);
            if (onComplete && response.data?.model_id) {
              onComplete(response.data.model_id);
            }
          } else if (status === 'failed') {
            setTrainingStatus('error');
            setError(message || 'Training failed');
            clearInterval(interval);
          }
        } else {
          setError(response.error || 'Failed to get training status');
          setTrainingStatus('error');
          clearInterval(interval);
        }
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jobId, trainingStatus, onComplete]);

  const handleSampleUpload = (response: { success: boolean, data?: UploadedSample, error?: string }) => {
    if (response.success && response.data) {
      setUploadedSamples(prev => [...prev, response.data]);
    } else {
      setError(response.error || 'Failed to upload sample');
    }
  };

  const handleTrainModel = async () => {
    if (uploadedSamples.length === 0) {
      setError('Please upload at least one voice sample');
      return;
    }

    setTrainingStatus('training');
    setProgress(0);
    setError(null);

    // Determine which training endpoint to use based on the selected model
    let trainingMethod;
    switch (voiceSettings.model) {
      case 'rvc':
        trainingMethod = voiceClone.trainRVC;
        break;
      case 'tortoise':
        trainingMethod = voiceClone.trainTortoise;
        break;
      case 'bark':
        trainingMethod = voiceClone.trainBark;
        break;
      default:
        trainingMethod = voiceClone.train;
    }
    
    // Also save the settings to ensure they're persisted on the backend
    try {
      await settings.save({
        voice: {
          model: voiceSettings.model,
          quality: voiceSettings.quality,
          enable_training: voiceSettings.enableTraining,
          training_epochs: voiceSettings.trainingEpochs,
          pitch_correction: voiceSettings.pitchCorrection
        }
      });
    } catch (err) {
      console.warn('Failed to save voice settings, continuing with training:', err);
    }

    // Prepare training data
    const trainingData = {
      samples: uploadedSamples.map(sample => sample.path),
      name: modelName || `Voice-${new Date().toISOString().split('T')[0]}`,
      epochs: voiceSettings.trainingEpochs,
      quality: voiceSettings.quality,
      pitch_correction: voiceSettings.pitchCorrection
    };

    // Start training
    const response = await trainingMethod(trainingData) as TrainingResponse;
    
    if (response.success && response.data) {
      setJobId(response.data.job_id);
    } else {
      setTrainingStatus('error');
      setError(formatApiError(response.error) || 'Failed to start training');
    }
  };

  const resetTraining = () => {
    setUploadedSamples([]);
    setTrainingStatus('idle');
    setProgress(0);
    setError(null);
    setJobId(null);
  };

  return (
    <Card className="w-full bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border-purple-700/50 text-white">
      <CardHeader>
        <CardTitle className="text-xl">Voice Training</CardTitle>
        <CardDescription className="text-purple-200">
          Train a new voice model using your audio samples
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="bg-red-900/50 border-red-700 text-white">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {trainingStatus === 'complete' ? (
          <Alert className="bg-green-900/50 border-green-700 text-white">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Voice model training completed successfully!</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model Name</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="Enter a name for your voice model"
                className="w-full px-3 py-2 bg-white/10 border border-purple-700/50 rounded-md text-white"
                disabled={trainingStatus === 'training'}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Voice Samples</label>
              <UploadHandler
                onUploadComplete={handleSampleUpload}
                onUploadError={setError}
                acceptedFileTypes="audio/*"
                maxSizeMB={50}
                uploadPath="/voice_samples"
                buttonText="Upload Voice Sample"
                className="w-full"
              />
              
              <div className="text-xs text-purple-200">
                {uploadedSamples.length > 0 
                  ? `${uploadedSamples.length} sample(s) uploaded` 
                  : 'No samples uploaded yet'}
              </div>
            </div>
            
            {trainingStatus === 'training' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Training Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/20" />
                <p className="text-xs text-purple-200">
                  Training with {voiceSettings.model.toUpperCase()} engine. 
                  This may take several minutes.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {trainingStatus === 'idle' || trainingStatus === 'error' ? (
          <>
            <Button 
              variant="outline" 
              onClick={resetTraining}
              className="bg-white/10 hover:bg-white/20 border-white/20"
            >
              Reset
            </Button>
            <Button 
              onClick={handleTrainModel}
              disabled={uploadedSamples.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Train Voice Model
            </Button>
          </>
        ) : trainingStatus === 'training' ? (
          <Button disabled className="w-full bg-purple-600 text-white">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Training in progress...
          </Button>
        ) : (
          <Button 
            onClick={resetTraining}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Train Another Model
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default VoiceTrainingPanel; 