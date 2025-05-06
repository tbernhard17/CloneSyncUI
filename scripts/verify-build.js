// Script to verify build output and ensure it's ready for deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const assetsDir = path.join(distDir, 'assets');
const indexHtmlPath = path.join(distDir, 'index.html');

console.log('🔍 Verifying build for duplicates and issues...');

// Store file hashes to detect duplicates
const fileHashes = new Map();
const fileSizes = new Map();
const duplicates = [];
const largeFiles = [];
const LARGE_FILE_THRESHOLD = 1024 * 1024; // 1MB

// Scan files recursively
function scanDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      scanDir(filePath);
    } else {
      // Calculate file hash
      const fileContent = fs.readFileSync(filePath);
      const hash = crypto.createHash('md5').update(fileContent).digest('hex');
      const sizeKB = stats.size / 1024;
      
      // Store file size
      fileSizes.set(filePath, sizeKB);
      
      // Check for large files
      if (stats.size > LARGE_FILE_THRESHOLD) {
        largeFiles.push({
          file: path.relative(distDir, filePath),
          size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB'
        });
      }
      
      // Check for duplicates
      if (fileHashes.has(hash)) {
        const existingFile = fileHashes.get(hash);
        duplicates.push({
          original: path.relative(distDir, existingFile),
          duplicate: path.relative(distDir, filePath),
          size: sizeKB.toFixed(2) + ' KB'
        });
      } else {
        fileHashes.set(hash, filePath);
      }
    }
  }
}

try {
  // Verify dist directory exists
  if (!fs.existsSync(distDir)) {
    console.error('❌ Build directory not found! Run "npm run build" first.');
    process.exit(1);
  }
  
  // Scan for duplicates
  scanDir(distDir);
  
  // Report findings
  console.log(`\n📦 Build output: ${distDir}`);
  console.log(`📊 Total files: ${fileHashes.size}`);
  
  // Check if we have duplicates
  if (duplicates.length > 0) {
    console.warn('⚠️ Found duplicate files:');
    duplicates.forEach(dup => {
      console.warn(`  - ${dup.duplicate} duplicates ${dup.original} (${dup.size})`);
    });
  } else {
    console.log('✅ No duplicate files found!');
  }
  
  // Check for large files
  if (largeFiles.length > 0) {
    console.warn('\n⚠️ Found large files that may slow down loading:');
    largeFiles.forEach(large => {
      console.warn(`  - ${large.file} (${large.size})`);
    });
  } else {
    console.log('✅ No unexpectedly large files found!');
  }
  
  // Calculate total build size
  const totalSizeKB = Array.from(fileSizes.values()).reduce((sum, size) => sum + size, 0);
  console.log(`📏 Total build size: ${(totalSizeKB / 1024).toFixed(2)} MB`);
  
  console.log('\n✅ Build verification complete!');
  if (duplicates.length === 0 && largeFiles.length === 0) {
    console.log('🚀 Your build looks good and is ready for deployment!');
  } else {
    console.log('⚠️ Your build has some issues that should be addressed before deployment.');
  }
} catch (error) {
  console.error('❌ Error during build verification:', error.message);
  process.exit(1);
}

// Additional helpful info
console.log('\nNext steps:');
console.log('1. Make sure your UI build is copied to the correct location in the Docker container');
console.log('2. Ensure your FastAPI app correctly mounts the static files');
console.log('3. Deploy to Google Cloud Run');
console.log('\nIf you encounter 404 errors, check:');
console.log('- The asset paths in the rendered HTML');
console.log('- The FastAPI route handlers for serving static files');
console.log('- The Cloud Run service configuration'); 