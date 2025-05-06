// Script to fix asset paths in the built index.html
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');
const assetsDir = path.join(distDir, 'assets');

console.log('Fixing asset paths in index.html and CSS...');

// Check if index.html exists
if (!fs.existsSync(indexHtmlPath)) {
  console.error('❌ index.html does not exist! Run npm run build first.');
  process.exit(1);
}

// Read index.html 
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Fix asset references to use absolute paths from the root
// We need absolute paths because only the assets folder is uploaded
const fixedHtml = indexHtml
  .replace(/src="\.\/(assets\/[^"]+)"/g, 'src="/$1"')
  .replace(/href="\.\/(assets\/[^"]+)"/g, 'href="/$1"')
  // Make sure CSS resources have proper paths
  .replace(/(url\(["']?)(\.\/)?assets\//g, '$1/assets/');

// Write the fixed index.html
fs.writeFileSync(indexHtmlPath, fixedHtml);
console.log('✅ Updated index.html with absolute paths for assets');

// Find and fix all CSS files
if (fs.existsSync(assetsDir)) {
  const cssFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.css'));
  
  console.log(`Found ${cssFiles.length} CSS files to process`);
  
  cssFiles.forEach(cssFile => {
    const cssFilePath = path.join(assetsDir, cssFile);
    console.log(`Processing CSS file: ${cssFile}`);
    
    let cssContent = fs.readFileSync(cssFilePath, 'utf8');
    
    // Fix various relative path patterns that could be used in CSS
    const fixedCss = cssContent
      // Fix relative paths with ../ prefix (goes up from assets directory)
      .replace(/url\((['"]?)\.\.\/([^'"()]+)(['"]?)\)/g, "url($1/$2$3)")
      
      // Fix relative paths with ./ prefix
      .replace(/url\((['"]?)\.\/([^'"()]+)(['"]?)\)/g, "url($1/$2$3)")
      
      // Fix paths that start with assets/
      .replace(/url\((['"]?)assets\/([^'"()]+)(['"]?)\)/g, "url($1/assets/$2$3)")
      
      // Fix any remaining relative paths without ./ or ../
      .replace(/url\((['"]?)(?!data:)(?!http)(?!\/)([\w-]+\/[^'"()]+)(['"]?)\)/g, "url($1/$2$3)");
    
    fs.writeFileSync(cssFilePath, fixedCss);
    console.log(`✅ Fixed paths in CSS file: ${cssFile}`);
  });
}

// Check for font files and ensure they have correct permissions
const fontDirs = ['fonts', 'font', path.join('assets', 'fonts')];
fontDirs.forEach(dir => {
  const fontDir = path.join(distDir, dir);
  if (fs.existsSync(fontDir)) {
    console.log(`Checking font directory: ${dir}`);
    const fontFiles = fs.readdirSync(fontDir);
    console.log(`Found ${fontFiles.length} font files`);
  }
});

console.log('\nNext steps:');
console.log('1. Make sure the content of the assets/ folder is uploaded to your server at /assets/');
console.log('2. Make sure the FastAPI app is configured to serve static files from /assets/');
console.log('3. If any styles are still missing, check the network tab in browser devtools to identify 404 errors');
console.log('4. Verify the CSS paths in DevTools to ensure they point to the correct locations'); 