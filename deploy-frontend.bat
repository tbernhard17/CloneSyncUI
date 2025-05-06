@echo off
echo CloneSync Frontend Deployment Script
echo ===================================

REM Set your GCP project variables
set PROJECT_ID=clonesync-457820
set BUCKET_NAME=clonesync-457820_cloudbuild

echo Building frontend...
call npm run build

echo Uploading to Google Cloud Storage...
call gsutil -m cp -r dist/* gs://%BUCKET_NAME%/

echo Deployment complete! Check the Google Cloud Storage bucket for the uploaded files.
echo.
echo Frontend URL: https://storage.googleapis.com/%BUCKET_NAME%/index.html
