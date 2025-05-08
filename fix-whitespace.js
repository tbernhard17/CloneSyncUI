// Recovery script to fix white screen issue
import fs from 'fs';
import path from 'path';

console.log('Starting white screen recovery...');

const distDir = path.join(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');
const backupPath = path.join(distDir, 'index.html.bak');

// Backup the current index.html if it exists
if (fs.existsSync(indexPath)) {
  console.log('Backing up current index.html...');
  fs.copyFileSync(indexPath, backupPath);
  console.log(`✅ Backup created at ${backupPath}`);
}

// Create a simplified working index.html
const simpleIndexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CloneSync</title>
    <meta name="description" content="CloneSync UI" />
    <meta name="author" content="CloneSync" />
    <script type="module" src="/assets/index-R5CrxBC6.js"></script>
    <link rel="stylesheet" href="/assets/index-Cy0GfYDc.css">
    <style>
      /* Emergency sidebar fix */
      .sidebar, .left-panel, [class*="sidebar"], [class*="left-panel"] {
        background-color: #1a1a1a !important;
        color: #fff !important;
      }
      .sidebar .nav-item, .sidebar-button, [class*="nav-item"], [class*="sidebar-button"] {
        position: relative !important;
        margin-top: 1rem !important;
        top: auto !important;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

// Write the simplified index.html
fs.writeFileSync(indexPath, simpleIndexHtml);
console.log(`✅ Created simplified index.html`);

console.log('\nWhite screen recovery complete!');
console.log('IMPORTANT: You MUST update the JavaScript and CSS filenames in the index.html if they are different in your build.');
console.log('Check the assets directory for the correct filenames and update them in the index.html file.');
console.log('\nTo use this fix:');
console.log('1. Check ui/dist/assets/ directory for the actual JS and CSS filenames');
console.log('2. Edit ui/dist/index.html to use the correct filenames (if they are different)');
console.log('3. Upload ONLY the fixed index.html file to your server'); 