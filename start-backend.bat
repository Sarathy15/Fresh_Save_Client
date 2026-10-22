@echo off
title FreshSave AI Backend
cd /d "%~dp0FreshSave-AI-HACK\FreshSave-AI-Backend"
..\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
pause
