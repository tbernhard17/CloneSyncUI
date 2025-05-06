import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import VideoPlayer from "@/components/VideoPlayer";
import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import FallbackMessage from "@/components/ui/fallback-message";

// Store GCS blob name (string) instead of File object
interface AppState {
  videoFileIdentifier: string | null;
  audioFileIdentifier: string | null;
  videoOriginalName: string | null; // Keep original name for display
  audioOriginalName: string | null;
  currentVoiceModel: string | null;
  scriptDialogOpen: boolean;
  scriptText: string;
  taskIds: {
    uploadTask: string | null;
    audioTask: string | null;
    voiceTask: string | null;
    lipSyncTask: string | null;
  };
  showTTS: boolean;
}

const Index = () => {
  const { toast } = useToast();
  
  // Initialize state with nulls or defaults
  const [state, setState] = useState<AppState>({
    videoFileIdentifier: null,
    audioFileIdentifier: null,
    videoOriginalName: null,
    audioOriginalName: null,
    currentVoiceModel: null,
    scriptDialogOpen: false,
    scriptText: localStorage.getItem('currentScriptText') || "Enter your script here...",
    taskIds: {
      uploadTask: null,
      audioTask: null,
      voiceTask: null,
      lipSyncTask: null
    },
    showTTS: false,
  });

  // Update handler signature to accept string identifier and optional original name
  const handleFileSelected = useCallback((fileType: 'audio' | 'video', identifier: string, originalFilename?: string) => {
    console.log(`[DEBUG] handleFileSelected: type=${fileType}, identifier=${identifier}, originalName=${originalFilename}`);
    if (fileType === 'video') {
      setState(prev => ({ 
        ...prev, 
        videoFileIdentifier: identifier,
        videoOriginalName: originalFilename || identifier // Store original name
      }));
    } else if (fileType === 'audio') {
      setState(prev => ({ 
        ...prev, 
        audioFileIdentifier: identifier,
        audioOriginalName: originalFilename || identifier
      }));
    }
  }, []); // Empty dependency array as setState handles updates

  const handleEditScript = () => {
    setState(prev => ({ ...prev, scriptDialogOpen: true }));
  };

  const handleSaveScript = () => {
    localStorage.setItem('currentScriptText', state.scriptText);
    setState(prev => ({ ...prev, scriptDialogOpen: false }));
    toast({
      title: "Script Saved",
      description: "Your script has been saved successfully."
    });
  };

  const handleToggleTTS = useCallback(() => {
    setState(prev => ({ ...prev, showTTS: !prev.showTTS }));
  }, []);
  
  // Update task ID handler using functional updates
  const handleTaskIdUpdate = useCallback((taskType: keyof AppState['taskIds'], taskId: string) => {
    setState(prev => ({ 
        ...prev, 
        taskIds: { ...prev.taskIds, [taskType]: taskId } 
    }));
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-[#1E1B4B] to-[#7E22CE] flex flex-col">
      <Header 
        onTTSToggle={handleToggleTTS} 
        onFileSelected={handleFileSelected}
        onTaskIdUpdate={handleTaskIdUpdate} // Pass down the task ID updater
        taskIds={state.taskIds} // Pass down current task IDs
        // Add other props Header might need like onLipsyncSettingsChange
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onEditScript={handleEditScript}
          // Pass GCS identifiers to Sidebar
          videoFileIdentifier={state.videoFileIdentifier}
          audioFileIdentifier={state.audioFileIdentifier}
          videoOriginalName={state.videoOriginalName}
          audioOriginalName={state.audioOriginalName}
          currentVoiceModel={state.currentVoiceModel}
          onTaskIdUpdate={handleTaskIdUpdate} // Pass down the task ID updater
          taskIds={state.taskIds} // Pass down current task IDs
        />
        <main className="flex-1 overflow-auto p-6 pt-12">
          {/* Add fallback message for Cloud Storage viewers */}
          <FallbackMessage 
            title="Cloud Storage Viewer Mode" 
            message="You're viewing this app from Cloud Storage. API interactions are limited and some features won't work."
          />
          
          <div className="h-full flex items-center justify-center">
            {/* VideoPlayer might need updates if it expects File objects */}
            <VideoPlayer 
              showTTS={state.showTTS} 
              videoFileIdentifier={state.videoFileIdentifier} // Pass identifier
              audioFileIdentifier={state.audioFileIdentifier} // Pass identifier
              // VideoPlayer might need GCS URIs or Signed URLs later
            />
          </div>
        </main>
      </div>

      <Dialog open={state.scriptDialogOpen} onOpenChange={(open) => setState(prev => ({...prev, scriptDialogOpen: open}))}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Script</DialogTitle>
            <DialogDescription>
              Enter the script for your voice clone. This text will be used for audio generation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={state.scriptText}
              onChange={(e) => setState(prev => ({...prev, scriptText: e.target.value }))}
              placeholder="Enter your script here..."
              className="min-h-[200px]"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setState(prev => ({...prev, scriptDialogOpen: false}))}>Cancel</Button>
            <Button onClick={handleSaveScript}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
