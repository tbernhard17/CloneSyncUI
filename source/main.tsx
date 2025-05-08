import { createRoot } from 'react-dom/client';
import App from './App.tsx'; // This App.tsx should also be in UI/source/

// Import the TooltipProvider from Radix UI (or your Shadcn UI component if applicable)
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
// If using Shadcn UI, it might be:
// import { TooltipProvider } from '@/components/ui/tooltip'; // Adjust path if needed

// Import all CSS files directly to ensure they're properly processed by Vite
// These paths are relative to UI/source/main.tsx
import './cursor-fix.css';
import './menu-fixes.css'; // Make sure this file exists in UI/source/ or adjust path
import './dialog-fixes.css';
import './index.css';

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <TooltipProvider>
      <App />
    </TooltipProvider>
  );
} else {
  console.error("Failed to find the root element. Make sure your HTML has an element with id='root'.");
}
