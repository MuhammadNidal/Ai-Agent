@echo off
echo ======================================
echo   AI Assistant - Starting Frontend
echo ======================================
echo.
echo Installing dependencies (first time only)...
cd /d "%~dp0\frontend"

if not exist "node_modules" (
    echo Installing React dependencies...
    npm install
    echo.
)

echo Starting React development server...
echo Frontend will run on: http://localhost:5000
echo.
echo Note: Make sure backend is running on port 5000
echo.
echo Starting frontend... (Press Ctrl+C to stop)
npm start