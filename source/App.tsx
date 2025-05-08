import React, { useState } from "react";
import "./App.css";
import LipsyncUploader from "./components/LipsyncUploader";

// Import your components conditionally to prevent crashes if they're not working
let Header, Sidebar, VideoPlayer, SettingsProvider;
try {
  // Try to import the components but don't fail if they can't be loaded
  const HeaderModule = require("./components/Header");
  const SidebarModule = require("./components/Sidebar");
  const VideoPlayerModule = require("./components/VideoPlayer");
  const ContextModule = require("./context/SettingsContext");
  
  Header = HeaderModule.default;
  Sidebar = SidebarModule.default;
  VideoPlayer = VideoPlayerModule.default;
  SettingsProvider = ContextModule.SettingsProvider;
} catch (error) {
  console.error("Failed to load some components:", error);
}

function App() {
  const [showFullUI, setShowFullUI] = useState(false);
  
  // If all components loaded successfully, use the full UI
  if (showFullUI && Header && Sidebar && VideoPlayer && SettingsProvider) {
    return (
      <SettingsProvider>
        <div className="app-container">
          <Sidebar />
          <div className="flex flex-col flex-1">
            <Header onTTSToggle={() => {}} />
            <main className="flex-1 p-4 overflow-auto bg-gradient-to-b from-[#09090b] to-[#1a1a2e]">
              <VideoPlayer />
            </main>
          </div>
        </div>
      </SettingsProvider>
    );
  }
  
  // Otherwise, show a simplified UI with a button to try loading the full UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#09090b] to-[#1a1a2e] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">CloneSync</h1>
          {!showFullUI && (
            <button 
              onClick={() => setShowFullUI(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
            >
              Load Full UI
            </button>
          )}
        </div>
        
        <div className="bg-slate-800/80 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-purple-500/50">
          <h2 className="text-2xl font-bold text-white mb-6">Lipsync Generator</h2>
          <LipsyncUploader />
        </div>
      </div>
    </div>
  );
}

export default App;
