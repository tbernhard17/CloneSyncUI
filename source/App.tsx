import React, { useState, useEffect, PropsWithChildren } from "react"; // Added PropsWithChildren
import "./App.css";

// Import your main components directly
import { SettingsProvider } from "./context/SettingsContext";
import { EngineProvider } from "./context/EngineContext";
import LipsyncUploader from "./components/LipsyncUploader";

// Define types for ErrorBoundary state and props
interface ErrorBoundaryProps extends PropsWithChildren<{}> {} // Use PropsWithChildren
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// ErrorBoundary component to catch and display rendering errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> { // Typed props and state
  constructor(props: ErrorBoundaryProps) { // Typed props
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Pick<ErrorBoundaryState, 'hasError'> { // Typed error
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { // Typed error and errorInfo
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#09090b] to-[#1a1a2e] flex flex-col items-center justify-center p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Something went wrong loading the UI</h2>
          <div className="bg-red-900/50 p-4 rounded-md border border-red-500 max-w-2xl w-full overflow-auto mb-4">
            <p className="font-mono text-sm">{this.state.error && this.state.error.toString()}</p>
            {this.state.errorInfo && (
              <pre className="mt-2 text-xs text-red-200 overflow-auto max-h-[300px]">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Define types for dynamically loaded components
interface LoadedComponents {
  Header: React.ComponentType<any> | null; // Use React.ComponentType for components
  Sidebar: React.ComponentType<any> | null;
  VideoPlayer: React.ComponentType<any> | null;
}

interface ComponentErrors {
  Header: string | null;
  Sidebar: string | null;
  VideoPlayer: string | null;
}

// Main content component that includes all the UI parts
const MainContent = () => {
  const [componentErrors, setComponentErrors] = useState<ComponentErrors>({ // Typed state
    Header: null,
    Sidebar: null,
    VideoPlayer: null
  });

  const [components, setComponents] = useState<LoadedComponents>({ // Typed state
    Header: null,
    Sidebar: null,
    VideoPlayer: null
  });

  // Load components dynamically
  useEffect(() => {
    const loadComponents = async () => {
      try {
        const HeaderModule = await import("./components/Header");
        setComponents(prev => ({ ...prev, Header: HeaderModule.default }));
      } catch (error: any) { // Typed error
        console.error("Failed to load Header:", error);
        setComponentErrors(prev => ({ ...prev, Header: error.toString() }));
      }

      try {
        const SidebarModule = await import("./components/Sidebar");
        setComponents(prev => ({ ...prev, Sidebar: SidebarModule.default }));
      } catch (error: any) { // Typed error
        console.error("Failed to load Sidebar:", error);
        setComponentErrors(prev => ({ ...prev, Sidebar: error.toString() }));
      }

      try {
        const VideoPlayerModule = await import("./components/VideoPlayer");
        setComponents(prev => ({ ...prev, VideoPlayer: VideoPlayerModule.default }));
      } catch (error: any) { // Typed error
        console.error("Failed to load VideoPlayer:", error);
        setComponentErrors(prev => ({ ...prev, VideoPlayer: error.toString() }));
      }
    };

    loadComponents();
  }, []);

  const Header = components.Header;
  const Sidebar = components.Sidebar;
  const VideoPlayer = components.VideoPlayer;

  // Check for any errors
  const hasErrors = Object.values(componentErrors).some(error => error !== null);

  return (
    <div className="app-container"> {/* This is styled in App.css: display: flex; height: 100vh; */}
      {hasErrors ? (
        <div className="w-full flex items-center justify-center">
          <div className="max-w-3xl w-full p-8 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-purple-500/50">
            <h2 className="text-2xl font-bold text-white mb-4">Component Loading Errors</h2>
            <div className="space-y-4">
              {Object.entries(componentErrors).map(([component, error]) => {
                if (!error) return null;
                return (
                  <div key={component} className="p-4 bg-red-900/50 border border-red-500/50 rounded-md">
                    <p className="font-medium text-white">{component} Error:</p>
                    <pre className="text-sm text-red-200 mt-2 overflow-auto max-h-[150px]">{error}</pre>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4">Fallback UI</h3>
              <LipsyncUploader />
            </div>
          </div>
        </div>
      ) : (
        <>
          {Sidebar && <Sidebar />} {/* Sidebar is a flex item */}
          <div className="flex flex-col flex-1"> {/* This div takes remaining horizontal space */}
            {Header && <Header onTTSToggle={() => {}} />} {/* Header is at the top of this column */}
            {/*
              MODIFIED LINE BELOW:
              Added flex, flex-col, items-center, and justify-center to the <main> tag
              to center its content (the VideoPlayer).
            */}
            <main className="flex-1 p-4 overflow-auto bg-gradient-to-b from-[#09090b] to-[#1a1a2e] flex flex-col items-center justify-center">
              {/* VideoPlayer will now be centered within this main area */}
              {VideoPlayer ? <VideoPlayer /> : <LipsyncUploader />}
            </main>
          </div>
        </>
      )}
    </div>
  );
};

// Load testing utilities in development mode
import('./utils/runpodTest').catch(err => 
  console.log('RunPod test utility not loaded - production mode')
);

function App() {
  return (
    <ErrorBoundary>
      <EngineProvider>
        <SettingsProvider>
          <MainContent />
        </SettingsProvider>
      </EngineProvider>
    </ErrorBoundary>
  );
}

export default App;