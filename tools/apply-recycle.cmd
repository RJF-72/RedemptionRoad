@echo off
setlocal
set PS1="%~dp0organize-mp3s.ps1"
set ROOT="%~dp0.."
set LIMIT=%1
if "%LIMIT%"=="" set LIMIT=1000

echo Applying up to %LIMIT% actions (Recycle Bin)...
powershell -NoProfile -ExecutionPolicy Bypass -File %PS1% -Root %ROOT% -Apply -DeleteMode Recycle -ActionLimit %LIMIT%

if %ERRORLEVEL% neq 0 (
  echo.
  echo PowerShell reported an error. Please copy the error text and share it.
  pause
)
endlocal
