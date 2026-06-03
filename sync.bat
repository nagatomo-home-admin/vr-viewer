@echo off
echo ==========================================
echo   Nagatomo Home - WEB Public Sync
echo ==========================================
echo.

cd /d "%~dp0"

:: [Safety Lock 1] Verify parent customers folder exists
if not exist "..\customers" (
    echo [ERROR] The parent "customers" folder does not exist!
    echo Sync has been aborted to protect your online data.
    echo.
    pause
    exit /b
)

:: [Safety Lock 2] Verify parent customers folder is not empty
dir /b /a "..\customers" 2>nul | findstr "^" >nul
if %errorlevel% neq 0 (
    echo [ERROR] The parent "customers" folder is empty!
    echo Sync has been aborted to protect your online data from deletion.
    echo.
    pause
    exit /b
)

echo [1/4] Copying latest HTML files...
copy /y "..\share.html" "share.html" >nul 2>&1
copy /y "..\share_slide.html" "share_slide.html" >nul 2>&1
copy /y "..\index.html" "index.html" >nul 2>&1
copy /y "..\Flowプロンプトジェネレーター.html" "Flowプロンプトジェネレーター.html" >nul 2>&1

echo [2/4] Syncing customer folders (Mirror Mode)...
robocopy "..\customers" "customers" /mir /ndl /nfl /np >nul 2>&1

echo [3/4] Checking repository status...
git rev-parse --is-inside-work-tree >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] This directory is not a Git repository.
    pause
    exit /b
)

echo [4/4] Uploading to GitHub...
git add .
git commit -m "Auto sync: %date% %time%"
git push

if %errorlevel% EQU 0 (
    echo.
    echo ==========================================
    echo   SUCCESS: Upload to GitHub completed!
    echo ==========================================
) else (
    echo.
    echo [ERROR] Sync failed. Please check internet or login status.
)
echo.
pause
