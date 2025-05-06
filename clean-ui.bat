@echo off
echo Cleaning UI dependencies and duplicates...

:: Navigate to the UI directory
cd /d "%~dp0"

:: Clean temporary Vite cache directories
echo Cleaning Vite cache directories...
rd /s /q "node_modules\.vite\deps_temp_*" 2>nul

:: Run the clean script
echo Running npm clean script...
call npm run clean

:: Optionally reinstall dependencies if needed
echo If you continue to have issues, run:
echo npm ci --force
echo.

echo UI cleanup complete.
echo Run "npm run dev" to start with clean cache.
pause 