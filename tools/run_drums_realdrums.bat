@echo off
setlocal enableextensions

REM One-click: Drums vs Playable RealDrums (percussive)
set BASE=http://127.0.0.1:8000
set REF="C:\Users\flana\Downloads\SOTA SYNTH\Drums"
set CAND="C:\Users\flana\Downloads\SOTA SYNTH\Playable RealDrums"
set OUT="tools\results\drums_realdrums.csv"

python tools\batch_compare.py --base %BASE% --profile percussive --ref %REF% --cand %CAND% --mode filename --out %OUT%
if %ERRORLEVEL% NEQ 0 (
  echo Error running drums comparison.
  pause
  exit /b 1
)

echo Done. Results: %OUT%
