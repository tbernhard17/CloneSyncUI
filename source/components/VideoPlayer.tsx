import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Play, Pause, Settings, Volume2, VolumeX, Maximize, Minimize, MusicIcon, Save, FileText, FileDown, Mic, AlignLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VideoPlayer = ({ 
  showTTS = false,
  videoFile = null,
  audioFile = null
}: { 
  showTTS?: boolean;
  videoFile?: File | null;
  audioFile?: File | null;
}) => {
  const { toast } = useToast();
  // State for media player
  const [volume, setVolume] = useState(80); // Increase default volume to 80%
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // Start at 0% progress
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('1080p');
  const [playbackSpeed, setPlaybackSpeed] = useState('Normal');
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [audioSrc, setAudioSrc] = useState<string>('');
  const [isAudioAvailable, setIsAudioAvailable] = useState(false);
  const [audioDelay, setAudioDelay] = useState(0); // Add audio delay in milliseconds
  const [showAudioControls, setShowAudioControls] = useState(false); // Toggle for showing sync controls
  
  // State for TTS/script editor
  const [scriptText, setText] = useState('');
  const [activeTab, setActiveTab] = useState('lyrics');
  const [selectedVoice, setSelectedVoice] = useState('default');
  const [customVoiceModels, setCustomVoiceModels] = useState<Array<{name: string, id: string}>>([]);
  const voiceInputRef = useRef<HTMLInputElement>(null);
  const [isTimestampMode, setIsTimestampMode] = useState(false);
  const [originalLyrics, setOriginalLyrics] = useState('');
  const [parodyLyrics, setParodyLyrics] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load voice models when component mounts (simplified)
  useEffect(() => {
    // Mock voice models for now
    setCustomVoiceModels([
      { name: 'Default Voice', id: 'default' },
      { name: 'Voice Model 1', id: 'voice1' },
      { name: 'Voice Model 2', id: 'voice2' }
    ]);
  }, []);
  
  // Handle file changes
  useEffect(() => {
    if (videoFile) {
      const newVideoUrl = URL.createObjectURL(videoFile);
      setVideoSrc(newVideoUrl);
      console.log("Video source set to:", newVideoUrl);
      
      // Clean up previous object URL
      return () => {
        URL.revokeObjectURL(newVideoUrl);
      };
    }
  }, [videoFile]);

  useEffect(() => {
    if (audioFile) {
      const newAudioUrl = URL.createObjectURL(audioFile);
      setAudioSrc(newAudioUrl);
      setIsAudioAvailable(true);
      console.log("Audio source set to:", newAudioUrl);
      
      // When new audio is loaded, reset the audio delay
      setAudioDelay(0);
      
      // Show a notification that sync controls are available
      toast({
        title: "Audio Loaded",
        description: "Use the sync controls if you notice audio-video sync issues.",
      });
      
      // Clean up previous object URL
      return () => {
        URL.revokeObjectURL(newAudioUrl);
      };
    } else {
      setIsAudioAvailable(false);
    }
  }, [audioFile]);

  // Initialize audio settings when component mounts
  useEffect(() => {
    // Set initial volume on both video and audio elements
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = isMuted;
      // Ensure audio context is initialized by a user gesture
      videoRef.current.addEventListener('click', initAudio);
      
      // Add event listeners for audio monitoring
      videoRef.current.addEventListener('waiting', () => {
        console.log("Video is waiting for data...");
      });
      
      videoRef.current.addEventListener('stalled', () => {
        console.log("Video playback has stalled");
      });
    }
    
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = isMuted;
      
      // Add event listeners for audio monitoring
      audioRef.current.addEventListener('waiting', () => {
        console.log("Audio is waiting for data...");
      });
      
      audioRef.current.addEventListener('stalled', () => {
        console.log("Audio playback has stalled");
      });
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('click', initAudio);
        videoRef.current.removeEventListener('waiting', () => {});
        videoRef.current.removeEventListener('stalled', () => {});
      }
      
      if (audioRef.current) {
        audioRef.current.removeEventListener('waiting', () => {});
        audioRef.current.removeEventListener('stalled', () => {});
      }
    };
  }, [volume, isMuted]);

  // Function to initialize audio (needs user gesture)
  const initAudio = () => {
    // Create and immediately suspend a new AudioContext to initialize audio system
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContext.resume().then(() => {
      console.log('AudioContext initialized');
    }).catch(err => {
      console.error('Failed to initialize AudioContext:', err);
    });
    
    // Play a silent audio for a moment to unlock audio
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          videoRef.current?.pause();
        }).catch(err => {
          console.error('Silent play failed:', err);
        });
      }
    }
    
    if (audioRef.current && isAudioAvailable) {
      // Also initialize the audio element
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          audioRef.current?.pause();
        }).catch(err => {
          console.error('Silent audio play failed:', err);
        });
      }
    }
  };

  // Synchronize video and audio playback
  useEffect(() => {
    const videoElement = videoRef.current;
    const audioElement = audioRef.current;
    
    if (!videoElement || !audioElement || !isAudioAvailable) return;
    
    const syncPlayback = () => {
      if (isPlaying) {
        // Apply the audio delay adjustment
        // Positive delay means audio is ahead, so we delay it
        // Negative delay means audio is behind, so we advance it
        const syncedTime = videoElement.currentTime - (audioDelay / 1000);
        
        // Only adjust if the difference is significant (more than 0.05 seconds)
        // This prevents constant minor adjustments that could cause stuttering
        if (Math.abs(audioElement.currentTime - syncedTime) > 0.05) {
          audioElement.currentTime = syncedTime;
        }
        
        audioElement.play().catch(err => {
          console.error("Error playing audio:", err);
        });
      } else {
        audioElement.pause();
      }
    };
    
    // Listen for play/pause events on the video
    videoElement.addEventListener('play', syncPlayback);
    videoElement.addEventListener('pause', () => audioElement.pause());
    
    // Improved seeking handler for better sync
    videoElement.addEventListener('seeking', () => {
      // When user is seeking, we want precise sync
      audioElement.currentTime = videoElement.currentTime - (audioDelay / 1000);
    });
    
    // Add periodic sync check to handle drift during playback
    const syncInterval = setInterval(() => {
      if (isPlaying) {
        const syncedTime = videoElement.currentTime - (audioDelay / 1000);
        // Only adjust if the difference is significant (more than 0.2 seconds)
        if (Math.abs(audioElement.currentTime - syncedTime) > 0.2) {
          audioElement.currentTime = syncedTime;
        }
      }
    }, 5000); // Check every 5 seconds
    
    return () => {
      videoElement.removeEventListener('play', syncPlayback);
      videoElement.removeEventListener('pause', () => audioElement.pause());
      videoElement.removeEventListener('seeking', () => {
        audioElement.currentTime = videoElement.currentTime - (audioDelay / 1000);
      });
      clearInterval(syncInterval);
    };
  }, [isPlaying, isAudioAvailable, audioDelay]);

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        if (audioRef.current && isAudioAvailable) {
          audioRef.current.pause();
        }
      } else {
        // Play video with sound
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
          alert("Unable to play the video. Please make sure a video file has been loaded.");
        });
        
        // If we have a separate audio file, play it in sync
        if (audioRef.current && isAudioAvailable) {
          // Apply the audio delay adjustment
          audioRef.current.currentTime = videoRef.current.currentTime - (audioDelay / 1000);
          audioRef.current.play().catch(err => {
            console.error("Error playing audio:", err);
          });
        }
      }
      setIsPlaying(!isPlaying);
    } else {
      console.warn("Video element not found");
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number) => {
    setVolume(value);
    const volumeLevel = value / 100;
    
    // Apply to video
    if (videoRef.current) {
      videoRef.current.volume = volumeLevel;
    }
    
    // Apply to audio if available
    if (audioRef.current) {
      audioRef.current.volume = volumeLevel;
    }
    
    setIsMuted(value === 0);
  };

  // Handle mute toggle
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    // Apply mute to video
    if (videoRef.current) {
      videoRef.current.muted = newMuteState;
    }
    
    // Apply mute to audio if available
    if (audioRef.current) {
      audioRef.current.muted = newMuteState;
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Handle quality change
  const changeQuality = (quality: string) => {
    setCurrentQuality(quality);
    console.log(`Changed quality to: ${quality}`);
  };

  // Handle playback speed change
  const changePlaybackSpeed = (speed: string) => {
    setPlaybackSpeed(speed);
    let rate = 1.0;
    
    switch (speed) {
      case '2x': rate = 2.0; break;
      case '1.75x': rate = 1.75; break;
      case '1.5x': rate = 1.5; break;
      case 'Normal': rate = 1.0; break;
      case '0.75x': rate = 0.75; break;
      case '0.5x': rate = 0.5; break;
      default: rate = 1.0;
    }
    
    // Apply speed to video
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    
    // Apply speed to audio if available
    if (audioRef.current && isAudioAvailable) {
      audioRef.current.playbackRate = rate;
    }
    
    console.log(`Changed playback speed to: ${speed}`);
  };

  // For TTS mode - Script handling
  const handleScriptTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleOriginalLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOriginalLyrics(e.target.value);
  };

  const handleParodyLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setParodyLyrics(e.target.value);
  };

  const handleGenerateVoice = () => {
    let textToConvert = activeTab === 'lyrics' ? parodyLyrics : scriptText;
    console.log(`Generating voice for ${activeTab} with voice ${selectedVoice}`);
    
    if (!textToConvert.trim()) {
      alert('Please enter some text before generating voice.');
      return;
    }
    
    if (selectedVoice === 'default' || !selectedVoice) {
      alert('Please select a voice model before generating.');
      return;
    }
    
    // For now, just show a success message
    alert('Voice generation started! This would typically send to your backend API.');
  };

  const handleSaveScript = () => {
    console.log("Saving script/lyrics");
    const dataToSave = {
      songTitle,
      artist,
      originalLyrics,
      parodyLyrics,
      script: scriptText
    };
    
    // Create downloadable content
    const content = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songTitle || 'script'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Script saved successfully!');
  };

  const handleAlignLyrics = () => {
    console.log("Aligning lyrics to audio timing");
    
    if (!audioFile) {
      alert('Please load an audio file first before aligning lyrics.');
      return;
    }
    
    if (!parodyLyrics.trim()) {
      alert('Please enter some lyrics before attempting alignment.');
      return;
    }
    
    // For now, just show a success message
    alert('Lyrics alignment started! This would analyze audio and align text with it.');
  };

  // Update progress bar
  useEffect(() => {
    if (!videoRef.current) return;
    
    const updateProgress = () => {
      if (videoRef.current) {
        const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(percentage);
      }
    };

    videoRef.current.addEventListener('timeupdate', updateProgress);
    
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  // Handle voice model upload
  const handleVoiceModelUpload = () => {
    if (voiceInputRef.current) {
      voiceInputRef.current.click();
    }
  };

  // Handle voice file selection
  const handleVoiceFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    console.log(`Selected voice model file: ${file.name}`);
    
    // In a real app, you would upload this file to your server
    // and add it to the customVoiceModels array
    const model = {
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      id: `custom_${Date.now()}`
    };
    
    // For demonstration - would be handled properly in a real implementation
    setCustomVoiceModels(prev => [...prev, model]);
    setSelectedVoice(model.id);
  };

  // Handle audio errors 
  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (!audioElement) return;
    
    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      const errorCode = audioElement.error ? audioElement.error.code : -1;
      
      // Provide more specific error messages based on the error code
      let errorMessage = "Failed to load or play the audio.";
      
      switch (errorCode) {
        case 1: // MEDIA_ERR_ABORTED
          errorMessage = "Audio playback was aborted.";
          break;
        case 2: // MEDIA_ERR_NETWORK
          errorMessage = "A network error caused the audio to fail.";
          break;
        case 3: // MEDIA_ERR_DECODE
          errorMessage = "The audio could not be decoded. Try a different file format.";
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          errorMessage = "The audio format is not supported by your browser.";
          break;
      }
      
      toast({
        title: "Audio Error",
        description: errorMessage + " Please try a different file.",
        variant: "destructive"
      });
      
      setIsAudioAvailable(false);
    };
    
    audioElement.addEventListener('error', handleError);
    
    // Add additional event for media errors
    const handleMediaError = () => {
      if (!audioElement.error) return;
      
      console.error("Media error:", audioElement.error.message);
      toast({
        title: "Audio Playback Error",
        description: "There was an issue with audio playback. You may need to adjust the sync or try a different file.",
        variant: "destructive"
      });
    };
    
    audioElement.addEventListener('canplay', () => {
      console.log("Audio can play");
    });
    
    audioElement.addEventListener('progress', () => {
      const buffered = audioElement.buffered;
      if (buffered.length > 0) {
        const bufferedPercent = (buffered.end(buffered.length - 1) / audioElement.duration) * 100;
        console.log(`Audio buffered: ${bufferedPercent.toFixed(2)}%`);
      }
    });
    
    return () => {
      audioElement.removeEventListener('error', handleError);
      audioElement.removeEventListener('canplay', () => {});
      audioElement.removeEventListener('progress', () => {});
    };
  }, []);

  // Add audio delay adjustment function
  const adjustAudioDelay = (value: number) => {
    setAudioDelay(value);
    // Log the current delay for debugging
    console.log(`Audio delay set to ${value}ms`);
    
    // If playing, immediately adjust sync
    if (isPlaying && audioRef.current && videoRef.current) {
      audioRef.current.currentTime = videoRef.current.currentTime - (value / 1000);
    }
  };

  // Toggle audio controls visibility
  const toggleAudioControls = () => {
    setShowAudioControls(!showAudioControls);
  };

  // Media player mode
  if (!showTTS) {
    return (
      <div className="w-full flex justify-center items-center" ref={containerRef}>
        <div className="w-full max-w-[1280px] bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <AspectRatio ratio={16 / 9} className="bg-black">
            <div className="relative w-full h-full">
              {/* Video Container */}
              <div className="absolute inset-0">
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  controlsList="nodownload"
                  disablePictureInPicture
                  onClick={togglePlay}
                  src={videoSrc}
                >
                  {!videoSrc && <div className="text-white text-center p-4">No video loaded. Use the Media menu to open a video file.</div>}
                </video>
                
                {/* Hidden audio element for synchronized playback */}
                {audioSrc && (
                  <audio 
                    ref={audioRef}
                    src={audioSrc} 
                    preload="auto"
                    crossOrigin="anonymous"
                    className="hidden" // Hide this element, we'll control it via code
                  />
                )}
                
                {/* Audio indicator when separate audio is loaded */}
                {isAudioAvailable && (
                  <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full flex items-center gap-2 text-white text-sm">
                    <MusicIcon className="w-4 h-4" />
                    <span className="mr-1">External Audio</span>
                    {audioDelay !== 0 && <span className="text-xs opacity-75">({audioDelay > 0 ? '+' : ''}{audioDelay}ms)</span>}
                  </div>
                )}
              </div>

              {/* Placeholder when no video is loaded */}
              {!videoSrc && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-white text-center p-4">
                    <p className="mb-4 text-xl">No video loaded</p>
                    <p className="text-gray-400">Use the Media menu to open a video file</p>
                  </div>
                </div>
              )}

              {/* Play/Pause Overlay Button (large, centered) */}
              {videoSrc && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white bg-black/30 hover:bg-black/50 rounded-full w-16 h-16"
                    onClick={togglePlay}
                  >
                    <Play className="w-8 h-8" />
                  </Button>
                </div>
              )}

              {/* YouTube-style Custom Controls */}
              {videoSrc && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-12">
                  {/* Audio sync controls - only show when separate audio is loaded */}
                  {isAudioAvailable && showAudioControls && (
                    <div className="px-4 pb-2 flex items-center gap-4">
                      <span className="text-white text-xs">Audio Sync:</span>
                      <div className="flex items-center gap-2 bg-black/50 p-2 rounded">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-white h-6 px-2 rounded-sm hover:bg-white/20"
                          onClick={() => adjustAudioDelay(audioDelay - 50)}
                        >
                          -50ms
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-white h-6 px-2 rounded-sm hover:bg-white/20"
                          onClick={() => adjustAudioDelay(audioDelay - 10)}
                        >
                          -10ms
                        </Button>
                        <div className="text-white text-xs w-14 text-center">
                          {audioDelay}ms
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-white h-6 px-2 rounded-sm hover:bg-white/20"
                          onClick={() => adjustAudioDelay(audioDelay + 10)}
                        >
                          +10ms
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-white h-6 px-2 rounded-sm hover:bg-white/20"
                          onClick={() => adjustAudioDelay(audioDelay + 50)}
                        >
                          +50ms
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-white h-6 px-2 rounded-sm hover:bg-white/20"
                          onClick={() => adjustAudioDelay(0)}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="h-12 flex items-center px-4 gap-4 text-white">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/20 rounded-full"
                      onClick={togglePlay}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    
                    <div className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer" onClick={(e) => {
                      // Handle seeking by clicking on the progress bar
                      if (videoRef.current) {
                        const bar = e.currentTarget;
                        const percent = e.nativeEvent.offsetX / bar.offsetWidth;
                        setProgress(percent * 100);
                        videoRef.current.currentTime = percent * videoRef.current.duration;
                        
                        // Sync audio position if available
                        if (audioRef.current && isAudioAvailable) {
                          // Apply the audio delay adjustment when seeking
                          audioRef.current.currentTime = videoRef.current.currentTime - (audioDelay / 1000);
                        }
                      }
                    }}>
                      <div 
                        className="h-full bg-red-600 rounded-full" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={toggleMute}
                          >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" className="w-[120px] p-3">
                          <Slider
                            value={[isMuted ? 0 : volume]}
                            max={100}
                            step={1}
                            className="h-24"
                            orientation="vertical"
                            onValueChange={(value) => handleVolumeChange(value[0])}
                          />
                        </PopoverContent>
                      </Popover>

                      {/* Add audio sync button when separate audio is available */}
                      {isAudioAvailable && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`text-white hover:bg-white/20 rounded-full ${showAudioControls ? 'bg-white/20' : ''}`}
                          onClick={toggleAudioControls}
                          title="Audio Sync Controls"
                        >
                          <MusicIcon className="w-5 h-5" />
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                            <Settings className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          {/* Add audio sync option to settings menu */}
                          {isAudioAvailable && (
                            <>
                              <DropdownMenuItem>
                                <span className="font-medium">Audio Sync</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => adjustAudioDelay(audioDelay - 250)}>
                                Delay -250ms
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => adjustAudioDelay(audioDelay - 100)}>
                                Delay -100ms
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => adjustAudioDelay(0)}>
                                Reset Sync (0ms)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => adjustAudioDelay(audioDelay + 100)}>
                                Delay +100ms
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => adjustAudioDelay(audioDelay + 250)}>
                                Delay +250ms
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <span className="font-medium">Quality</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeQuality('1080p')}>
                            1080p {currentQuality === '1080p' && '✓'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeQuality('720p')}>
                            720p {currentQuality === '720p' && '✓'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeQuality('480p')}>
                            480p {currentQuality === '480p' && '✓'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeQuality('360p')}>
                            360p {currentQuality === '360p' && '✓'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <span className="font-medium">Playback Speed</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changePlaybackSpeed('2x')}>
                            2x {playbackSpeed === '2x' && '✓'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changePlaybackSpeed('1.75x')}>
                            1.75x {playbackSpeed === '1.75x' && '✓'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changePlaybackSpeed('1.5x')}>
                            1.5x {playbackSpeed === '1.5x' && '✓'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changePlaybackSpeed('Normal')}>
                            Normal {playbackSpeed === 'Normal' && '✓'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changePlaybackSpeed('0.75x')}>
                            0.75x {playbackSpeed === '0.75x' && '✓'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changePlaybackSpeed('0.5x')}>
                            0.5x {playbackSpeed === '0.5x' && '✓'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white hover:bg-white/20 rounded-full"
                        onClick={toggleFullscreen}
                      >
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AspectRatio>
        </div>
      </div>
    );
  }

  // TTS mode content - Enhanced script and parody lyrics editor with CloneSync branding
  if (showTTS) {
    return (
      <div className="w-full flex justify-center items-center flex-col">
        <div className="w-full max-w-[1280px] bg-gradient-to-b from-purple-900/80 to-indigo-900/80 backdrop-blur-sm rounded-lg overflow-hidden p-6 border border-purple-400/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Script & Lyrics Editor</h2>
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveScript} 
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Save size={16} />
                Save
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-4 bg-purple-950/50">
              <TabsTrigger value="lyrics" className="data-[state=active]:bg-purple-800">
                <MusicIcon className="h-4 w-4 mr-2" />
                Parody Lyrics
              </TabsTrigger>
              <TabsTrigger value="script" className="data-[state=active]:bg-purple-800">
                <FileText className="h-4 w-4 mr-2" />
                Full Script
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="lyrics" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Song Title</label>
                  <Input 
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="Enter song title"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Artist</label>
                  <Input 
                    value={artist} 
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Enter artist name" 
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Original Lyrics</label>
                  <Textarea
                    placeholder="Paste the original song lyrics here..."
                    value={originalLyrics}
                    onChange={handleOriginalLyricsChange}
                    className="h-[300px] bg-white/10 border-white/20 text-white resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Parody Lyrics</label>
                  <Textarea
                    placeholder="Type your parody lyrics here..."
                    value={parodyLyrics}
                    onChange={handleParodyLyricsChange}
                    className="h-[300px] bg-white/10 border-white/20 text-white resize-none"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="script" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Full Script</label>
                <Textarea
                  placeholder="Type your full script here for text-to-speech conversion..."
                  value={scriptText}
                  onChange={handleScriptTextChange}
                  className="w-full h-[400px] bg-white/10 border-white/20 text-white resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 border-t border-white/20 pt-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-300 whitespace-nowrap">Voice Model</label>
                <div className="flex items-center gap-2">
                  <Select 
                    value={selectedVoice} 
                    onValueChange={setSelectedVoice}
                  >
                    <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Voice</SelectItem>
                      <SelectItem value="eminem">Eminem</SelectItem>
                      <SelectItem value="morgan">Morgan Freeman</SelectItem>
                      <SelectItem value="taylor">Taylor Swift</SelectItem>
                      <SelectItem value="snoop">Snoop Dogg</SelectItem>
                      
                      {/* Custom voice models */}
                      {customVoiceModels.length > 0 && (
                        <>
                          <SelectItem disabled value="custom-header">
                            <span className="font-medium">Custom Voice Models</span>
                          </SelectItem>
                          {customVoiceModels.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="border-white/20 hover:bg-purple-700 text-white" 
                    onClick={handleVoiceModelUpload}
                    title="Upload custom voice model"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="border-white/20 hover:bg-purple-700 text-white flex items-center gap-2"
                onClick={handleAlignLyrics}
              >
                <AlignLeft size={16} />
                Align Lyrics
              </Button>
            </div>
            
            <Button 
              onClick={handleGenerateVoice}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <Mic size={16} />
              Generate Voice
            </Button>
          </div>
          
          {/* Hidden voice model file input */}
          <input 
            type="file" 
            ref={voiceInputRef} 
            className="hidden" 
            accept=".pth,.bin,.model" 
            onChange={handleVoiceFileSelected} 
          />
        </div>
      </div>
    );
  }

  return null; // Fallback return to satisfy component structure
};

export default VideoPlayer;
