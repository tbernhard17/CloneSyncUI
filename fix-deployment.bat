@echo off
echo ============================================================
echo       CloneSync Frontend CSS/Styling Fix Script
echo ============================================================

cd ui

echo.
echo Step 1: Building frontend with production settings...
call npm run build:prod

if %ERRORLEVEL% NEQ 0 (
  echo Frontend build failed! Please check errors above.
  exit /b %ERRORLEVEL%
)

echo.
echo Step 2: Fixing CSS path references in built files...

:: Create a temporary fix-css.js file
echo // Temporary script to fix CSS paths > temp-fix-css.js
echo import fs from 'fs'; >> temp-fix-css.js
echo import path from 'path'; >> temp-fix-css.js
echo const cssDir = path.join(process.cwd(), 'dist', 'assets'); >> temp-fix-css.js
echo const cssFiles = fs.readdirSync(cssDir).filter(f =^> f.endsWith('.css')); >> temp-fix-css.js
echo console.log('Found CSS files:', cssFiles); >> temp-fix-css.js
echo cssFiles.forEach(file =^> { >> temp-fix-css.js
echo   const filePath = path.join(cssDir, file); >> temp-fix-css.js
echo   let content = fs.readFileSync(filePath, 'utf8'); >> temp-fix-css.js
echo   // Fix relative path issues in CSS >> temp-fix-css.js
echo   content = content.replace(/url\(['"]?\.\.\//g, "url('/"); >> temp-fix-css.js
echo   content = content.replace(/url\(['"]?\.\/assets\//g, "url('/assets/"); >> temp-fix-css.js
echo   content = content.replace(/url\(['"]?assets\//g, "url('/assets/"); >> temp-fix-css.js
echo   fs.writeFileSync(filePath, content); >> temp-fix-css.js
echo   console.log('Fixed CSS paths in', file); >> temp-fix-css.js
echo }); >> temp-fix-css.js

:: Run the temporary CSS fix script
call node temp-fix-css.js
del temp-fix-css.js

echo.
echo Step 3: Ensuring proper index.html references...
:: Fix the index.html asset references
call node scripts/fix-asset-paths.js

echo.
echo Step 4: Process complete! Test the application for styling fixes.
echo.
echo NOTE: If CSS issues persist, manually check for 404 errors in browser dev tools
echo       and verify that FastAPI is serving assets from the correct location.
echo.

cd ..

echo Press any key to exit...
pause > nul 