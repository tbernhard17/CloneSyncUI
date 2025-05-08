@echo off
echo CloneSync UI Build Script
echo =======================

echo Step 1: Closing potential file handles...
taskkill /F /IM explorer.exe >nul 2>&1
timeout /t 2 /nobreak >nul
start explorer.exe

echo Step 2: Making sure dist directory is clean...
if exist "dist" (
    rmdir /S /Q "dist" >nul 2>&1
    timeout /t 1 /nobreak >nul
)

echo Step 2b: Removing any JavaScript config file to ensure TypeScript config is used...
if exist "vite.config.js" (
    del /F /Q "vite.config.js" >nul 2>&1
    echo Removed vite.config.js to prevent conflicts
)

echo Step 3: Building the UI...
call npm run build

echo Build process complete!