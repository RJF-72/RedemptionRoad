@echo off
setlocal enableextensions

REM One-click: Guitar vs Piano cross-compare (melodic)
set BASE=https://redemptionrd.shop
set REF="C:\Users\flana\Downloads\SOTA SYNTH\Guitar"
set CAND="C:\Users\flana\Downloads\SOTA SYNTH\Piano"
set OUT="tools\results\guitar_piano.csv"

python tools\batch_compare.py --base %BASE% --profile melodic --ref %REF% --cand %CAND% --mode cross --out %OUT%
if %ERRORLEVEL% NEQ 0 (
  echo Error running guitar vs piano comparison.
  pause
  exit /b 1
)

echo Done. Results: %OUT%
pause
