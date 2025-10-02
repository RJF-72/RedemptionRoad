@echo off
setlocal enableextensions

REM Run guitar↔piano (melodic, cross) and drums↔realdrums (percussive, filename)
call tools\run_guitar_piano.bat
call tools\run_drums_realdrums.bat

echo All comparisons complete. CSVs in tools\results.
pause
