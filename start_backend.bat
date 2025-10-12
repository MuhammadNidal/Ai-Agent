@echo off
echo ======================================
echo    AI Assistant - Starting Backend
echo ======================================
echo.
echo Starting Flask API server...
echo Backend will run on: http://localhost:5000
echo.
cd /d "%~dp0"
uv sync
echo.
echo Starting server... (Press Ctrl+C to stop)
uv run python app.py