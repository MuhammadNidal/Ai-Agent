@echo off
echo Starting AI Assistant Web Interface...
echo.
echo Make sure your .env file contains GEMINI_API_KEY
echo.
echo Open your browser and go to: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.
uv run python app.py
pause