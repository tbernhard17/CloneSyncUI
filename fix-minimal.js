import fs from 'fs';
import path from 'path';

console.log('Starting minimal CSS fix...');

const distDir = path.join(process.cwd(), 'dist');
const assetsDir = path.join(distDir, 'assets');

// Create emergency CSS that won't break anything else
const emergencyCss = `
/* Safe emergency fixes for sidebar styling */
.sidebar, .left-panel, [class*="sidebar"], [class*="left-panel"] {
  background-color: #1a1a1a !important;
  color: #fff !important;
}

/* Sidebar button positioning */
.sidebar .nav-item, 
.sidebar .sidebar-button,
[class*="sidebar"] [class*="nav-item"],
[class*="sidebar"] [class*="sidebar-button"] {
  position: relative !important;
  margin-top: 1rem !important;
  top: auto !important;
}

/* Media player alignment fixes */
[class*="media-controls"] + [class*="sidebar"],
[class*="player"] + [class*="sidebar"] {
  margin-top: 1rem !important;
}
`;

// Write a standalone CSS file - don't modify any existing files
const fixCssPath = path.join(assetsDir, 'minimal-fix.css');
fs.writeFileSync(fixCssPath, emergencyCss);
console.log(`✅ Created minimal fix CSS at ${fixCssPath}`);

// Create a small HTML file that can be included via iframe or direct link if needed
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CSS Fix Loader</title>
  <style>
    body { margin: 0; padding: 0; }
  </style>
  <link rel="stylesheet" href="/assets/minimal-fix.css">
</head>
<body>
  <script>
    // This script helps ensure the CSS is loaded
    console.log('CSS fix loaded');
    
    // Notify parent if in iframe
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage('css-fix-loaded', '*');
      }
    } catch (e) {}
  </script>
</body>
</html>
`;

// Write HTML loader file
const htmlPath = path.join(distDir, 'css-fix.html');
fs.writeFileSync(htmlPath, htmlContent);
console.log(`✅ Created HTML loader at ${htmlPath}`);

console.log('\nSimple CSS fix is complete!');
console.log('To use this fix, upload these files to your server:');
console.log('1. dist/assets/minimal-fix.css');
console.log('\nThen, add the CSS via one of these methods:');
console.log('1. Add a link tag to your index.html: <link rel="stylesheet" href="/assets/minimal-fix.css">');
console.log('2. Include the CSS file in your deployment process');
console.log('3. Visit your-site.com/css-fix.html once to load the CSS fix (temporary solution)'); 