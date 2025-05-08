import React from "react";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import VideoPlayer from "./components/VideoPlayer";
import { SettingsProvider } from "./context/SettingsContext";

function App() {
  return (
    <SettingsProvider>
      <div className="app-container">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-4 overflow-auto">
            <VideoPlayer />
          </main>
        </div>
      </div>
    </SettingsProvider>
  );
}

export default App;
