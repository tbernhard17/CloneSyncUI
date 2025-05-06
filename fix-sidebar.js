// Script to fix sidebar styling issues
import fs from 'fs';
import path from 'path';

console.log('Starting sidebar styling fix...');

// Find the CSS file containing sidebar styling
const distDir = path.join(process.cwd(), 'dist');
const assetsDir = path.join(distDir, 'assets');
const cssFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.css'));

console.log(`Found ${cssFiles.length} CSS files to check`);

// Likely fixes needed:
// 1. Sidebar background color (look for .sidebar, .left-panel classes)
// 2. Sidebar button positioning (verify top/margin properties)

cssFiles.forEach(file => {
  const cssPath = path.join(assetsDir, file);
  let content = fs.readFileSync(cssPath, 'utf8');
  let modified = false;
  let fixCount = 0;

  // Check if this file contains sidebar styling
  if (content.includes('sidebar') || content.includes('left-panel') || content.includes('nav-item')) {
    console.log(`Found sidebar styling in ${file}`);
    
    // 1. Fix sidebar background color (ensure it has a background-color property)
    if (content.includes('.sidebar') || content.includes('.left-panel')) {
      // Ensure sidebar background color is set and using absolute paths for any backgrounds
      content = content.replace(
        /(\.sidebar|\.left-panel)[^{]*{([^}]*)}/g, 
        (match, className, props) => {
          // Only add background if not already present
          if (!props.includes('background')) {
            return `${className}{${props}background-color:var(--sidebar-bg, #1a1a1a);}`; 
          }
          // Fix any background urls
          return match.replace(/url\(['"]?([^'":/)])/g, "url('/$1");
        }
      );
      fixCount++;
    }
    
    // 2. Fix sidebar button positioning
    if (content.includes('nav-item') || content.includes('sidebar-button')) {
      // Find and adjust button positioning
      content = content.replace(
        /(\.nav-item|\.sidebar-button)[^{]*{([^}]*)}/g,
        (match, className, props) => {
          // Adjust positioning properties only if they seem to be wrong
          if (props.includes('top:0') || props.includes('margin-top:0')) {
            return `${className}{${props.replace(/top:\s*0/, 'top:auto').replace(/margin-top:\s*0/, 'margin-top:1rem')}}`;
          }
          return match;
        }
      );
      fixCount++;
    }

    // Fix any URL paths in the sidebar CSS
    content = content.replace(/url\(['"]?(\.\.\/|\.\/)?([^'"):/]+)/g, "url('/$2");
    
    if (fixCount > 0) {
      fs.writeFileSync(cssPath, content);
      console.log(`✅ Applied ${fixCount} fixes to sidebar styling in ${file}`);
      modified = true;
    }
  }

  if (!modified) {
    console.log(`No sidebar styling found in ${file}`);
  }
});

// Now create some emergency CSS rules in a new file that will ensure the sidebar is styled correctly
const emergencyCss = `
/* Emergency fixes for sidebar styling */
.sidebar, .left-panel {
  background-color: var(--sidebar-bg, #1a1a1a) !important;
  color: var(--sidebar-text, #ffffff) !important;
}

.sidebar-button, .nav-item {
  margin-top: 1rem !important;
  top: auto !important;
  position: relative !important;
}

.sidebar-content {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
}

/* Fix sidebar button alignment with media player */
.media-controls-wrapper + .sidebar-buttons,
.media-player + .sidebar-buttons,
.player-container + .sidebar-buttons {
  margin-top: 1rem !important;
  align-items: center !important;
}
`;

// Write emergency CSS file
const emergencyCssPath = path.join(assetsDir, 'sidebar-fix.css');
fs.writeFileSync(emergencyCssPath, emergencyCss);
console.log(`✅ Created emergency sidebar fix CSS at ${emergencyCssPath}`);

// Update index.html to include our emergency CSS
const indexPath = path.join(distDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Add the emergency CSS right before </head>
if (!indexHtml.includes('sidebar-fix.css')) {
  indexHtml = indexHtml.replace(
    '</head>',
    `  <link rel="stylesheet" href="/assets/sidebar-fix.css">\n</head>`
  );
  fs.writeFileSync(indexPath, indexHtml);
  console.log('✅ Added emergency CSS to index.html');
}

console.log('\nSidebar styling fixes complete! Deploy the updated files to your server.');
console.log('Make sure to upload the new sidebar-fix.css file to your assets directory.'); 