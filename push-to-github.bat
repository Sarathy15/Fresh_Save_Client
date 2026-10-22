@echo off
title Push FreshSave AI to GitHub
echo ========================================================
echo  Pushing FreshSave AI (main branch) to GitHub
echo  Repository: https://github.com/gokul2v6-ux/customer.git
echo ========================================================
echo.
cd /d "%~dp0"
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo  SUCCESS: Your project has been pushed to GitHub!
    echo ========================================================
) else (
    echo [ERROR] Push failed. If prompted, please complete GitHub sign-in.
)
echo.
pause
