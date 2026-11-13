@echo off
title Engineers Horizon website - localhost
cd /d "%~dp0"
if not exist "%~dp0serve.ps1" goto notextracted
if not exist "%~dp0Home.dc.html" goto notextracted
echo Starting the Engineers Horizon website...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
echo.
echo  The website has stopped. If you see a red error above, send a screenshot of this window.
pause
exit /b
:notextracted
echo.
echo  The website files are not next to this starter file.
echo  This usually means it was opened from inside the zip.
echo.
echo  1. Close this window.
echo  2. Right-click Engineers-Horizon-Website.zip and choose "Extract All...", then "Extract".
echo  3. Open the extracted engineers-horizon-website folder.
echo  4. Double-click "Start Website (Windows).bat" in that folder.
echo.
pause
