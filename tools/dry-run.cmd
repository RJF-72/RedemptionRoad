@echo off
setlocal
set PS1="%~dp0organize-mp3s.ps1"
set ROOT="%~dp0.."

powershell -NoProfile -ExecutionPolicy Bypass -File %PS1% -Root %ROOT%

if %ERRORLEVEL% neq 0 (
  echo.
  echo PowerShell reported an error. Please copy the error text and share it.
  pause
)
endlocal
