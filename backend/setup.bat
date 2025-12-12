@echo off
echo ========================================
echo Pulse V2 - Backend Setup
echo ========================================
echo.

echo Creating virtual environment...
python -m venv .venv
echo.

echo Activating virtual environment...
call .venv\Scripts\activate
echo.

echo Installing dependencies...
pip install -r requirements.txt
echo.

echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Create .env file with your GROQ_API_KEY
echo 2. Run: uvicorn app.main:app --reload
echo.
echo Get free Groq API key at: https://console.groq.com
echo.
pause
