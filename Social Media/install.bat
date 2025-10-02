@echo off
echo ===============================================
echo    REDEMPTION MARKETING - INSTALLATION
echo    Copyright (c) 2025 Redemption Road
echo    All Rights Reserved
echo ===============================================
echo.
echo Installing Redemption Marketing with Open Source AI...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH. 
    echo Please install Python 3.8+ first from python.org
    echo.
    pause
    exit /b 1
)

echo Python found. Installing required packages...
echo This may take a few minutes as we're installing AI models...
echo.

pip install --upgrade pip
pip install -r requirements.txt

echo.
echo ===============================================
echo    REDEMPTION MARKETING - INSTALLATION COMPLETE
echo ===============================================
echo.
echo Features available:
echo - Advanced content generation using open-source AI
echo - Commercial video scripts (20-90 seconds)
echo - Music video concepts (up to 300 seconds)
echo - Marketing video production planning
echo - Professional analytics and insights
echo - Local AI processing (no API credits needed)
echo.
echo To run Redemption Marketing:
echo python main.py
echo.
echo LEGAL NOTICE:
echo This software is licensed under strict commercial terms.
echo See LICENSE file for complete terms and conditions.
echo.
echo For support: support@redemptionroad.com
echo For licensing: licensing@redemptionroad.com
echo.
echo Note: First run may take longer as AI models are downloaded
echo.
pause