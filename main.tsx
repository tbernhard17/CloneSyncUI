import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// Import all CSS files directly to ensure they're properly processed by Vite
import './cursor-fix.css'
import './menu-fixes.css'
import './dialog-fixes.css'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
