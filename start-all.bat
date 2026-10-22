@echo off
title FreshSave AI - Full Stack Launcher
echo ===================================================
echo  Starting FreshSave AI - Backend & Customer Website
echo ===================================================
echo.

start "FreshSave AI Backend" cmd /k "cd /d "%~dp0FreshSave-AI-HACK\FreshSave-AI-Backend" && ..\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

start "FreshSave AI Customer Website" cmd /k "cd /d "%~dp0customer-website" && npm.cmd run dev -- --port 5173"

echo Both services launched!
echo.
echo Customer Website: http://localhost:5173/
echo Backend API Docs: http://127.0.0.1:8000/docs
echo.
pause
