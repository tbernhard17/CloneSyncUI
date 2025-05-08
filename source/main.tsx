

import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Import the TooltipProvider from Radix UI
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';

// Import all CSS files directly to ensure they're properly processed by Vite
import './cursor-fix.css';
import './menu-fixes.css'; // Make sure this file exists in your 'source' folder or adjust path
import './dialog-fixes.css';
import './index.css';

// Get the root element from your HTML
const rootElement = document.getElementById("root");

// Ensure the root element exists before trying to render
if (rootElement) {
  createRoot(rootElement).render(
    // Wrap your main App component with the TooltipProvider
    // This makes the tooltip functionality available to all components inside App
    <TooltipProvider>
      <App />
    </TooltipProvider>
  );
} else {
  console.error("Failed to find the root element. Make sure your HTML has an element with id='root'.");
}
