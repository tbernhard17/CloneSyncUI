import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to clean
const pathsToClean = [
  // Vite cache directories
  '../node_modules/.vite/deps_temp_*',
  // Keep only the main deps directory
  '!../node_modules/.vite/deps',
  // Other temporary files that might be duplicated
  '../node_modules/.cache',
];

console.log('🧹 Cleaning UI cache and temp files...');

// Clean Vite cache directories
pathsToClean.forEach(pattern => {
  try {
    // Use glob pattern to find all matching directories
    const globPattern = path.resolve(__dirname, pattern);
    console.log(`Removing: ${globPattern}`);
    
    if (pattern.startsWith('!')) {
      console.log(`  Keeping: ${pattern.substring(1)}`);
      return;
    }
    
    // For Windows compatibility, use rimraf pattern through node
    if (pattern.includes('*')) {
      execSync(`npx rimraf "${globPattern}"`, { stdio: 'inherit' });
    } else {
      if (fs.existsSync(globPattern)) {
        if (fs.statSync(globPattern).isDirectory()) {
          fs.rmSync(globPattern, { recursive: true, force: true });
        } else {
          fs.unlinkSync(globPattern);
        }
        console.log(`  Removed: ${globPattern}`);
      }
    }
  } catch (error) {
    console.error(`Error cleaning ${pattern}:`, error.message);
  }
});

// Ensure we have clean Vite cache
try {
  const viteDir = path.resolve(__dirname, '../node_modules/.vite');
  if (!fs.existsSync(viteDir)) {
    fs.mkdirSync(viteDir, { recursive: true });
  }
  
  const depsDir = path.resolve(viteDir, 'deps');
  if (!fs.existsSync(depsDir)) {
    fs.mkdirSync(depsDir, { recursive: true });
  }
  
  console.log('✅ Cache directories cleaned successfully.');
} catch (error) {
  console.error('Error ensuring cache directories exist:', error.message);
}

console.log('🚀 Run "npm run dev" to start development with a clean cache.'); 