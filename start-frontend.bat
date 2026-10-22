@echo off
title FreshSave AI Customer Website
cd /d "%~dp0customer-website"
npm.cmd run dev -- --port 5173
pause
