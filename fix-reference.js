// Script to fix the JS references in index.html
import fs from 'fs';
import path from 'path';

console.log('Starting index.html reference fix...');

const distDir = path.join(process.cwd(), 'dist');
const assetsDir = path.join(distDir, 'assets');
const indexPath = path.join(distDir, 'index.html');
const backupPath = path.join(distDir, 'index.html.bak2');

// Backup the current index.html if it exists
if (fs.existsSync(indexPath)) {
  console.log('Backing up current index.html...');
  fs.copyFileSync(indexPath, backupPath);
  console.log(`✅ Backup created at ${backupPath}`);
}

// Get all JS files in the assets directory
const jsFiles = fs.readdirSync(assetsDir)
  .filter(file => file.endsWith('.js'))
  .map(file => ({ name: file, fullPath: path.join(assetsDir, file) }));

console.log('Found JS files in assets directory:');
jsFiles.forEach(file => console.log(` - ${file.name}`));

// Get all CSS files in the assets directory
const cssFiles = fs.readdirSync(assetsDir)
  .filter(file => file.endsWith('.css'))
  .map(file => ({ name: file, fullPath: path.join(assetsDir, file) }));

console.log('Found CSS files in assets directory:');
cssFiles.forEach(file => console.log(` - ${file.name}`));

// Create a simplified but working index.html
const mainJsFile = jsFiles.find(file => file.name.startsWith('Index-') || file.name.startsWith('index-'));
const dataVendorFile = jsFiles.find(file => file.name.includes('data-vendor'));
const reactVendorFile = jsFiles.find(file => file.name.includes('react-vendor'));
const uiVendorFile = jsFiles.find(file => file.name.includes('ui-vendor'));
const mainCssFile = cssFiles.find(file => file.name.includes('index-') || file.name.includes('Index-'));

if (!mainJsFile) {
  console.error('❌ Could not find main JS file (index-*.js or Index-*.js)');
  process.exit(1);
}

if (!mainCssFile) {
  console.error('❌ Could not find main CSS file (index-*.css or Index-*.css)');
  process.exit(1);
}

// Create a new index.html with correct references
const newIndexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CloneSync</title>
    <meta name="description" content="CloneSync UI" />
    <meta name="author" content="CloneSync" />

    <meta property="og:title" content="CloneSync" />
    <meta property="og:description" content="CloneSync UI" />
    <meta property="og:type" content="website" />
    <script type="module" crossorigin src="/assets/${mainJsFile.name}"></script>
${reactVendorFile ? `    <link rel="modulepreload" crossorigin href="/assets/${reactVendorFile.name}">\n` : ''}${uiVendorFile ? `    <link rel="modulepreload" crossorigin href="/assets/${uiVendorFile.name}">\n` : ''}${dataVendorFile ? `    <link rel="modulepreload" crossorigin href="/assets/${dataVendorFile.name}">\n` : ''}    <link rel="stylesheet" crossorigin href="/assets/${mainCssFile.name}">
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

// Write the new index.html
fs.writeFileSync(indexPath, newIndexHtml);
console.log(`✅ Created updated index.html with correct asset references`);
console.log(`Main JS file: ${mainJsFile.name}`);
console.log(`Main CSS file: ${mainCssFile.name}`);

console.log('\nReference fix complete!');
console.log('Upload index.html to your server to fix the white screen issue.'); 