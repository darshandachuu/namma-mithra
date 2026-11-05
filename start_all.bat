@echo off
title CampusCare Full Application Launcher
echo ========================================================
echo   Launching CampusCare Platform (Backend + Frontend)
echo ========================================================
echo.
echo 1. Starting Backend in new window...
start "CampusCare Backend (Flask:5000)" cmd /k "cd /d %~dp0backend && python run.py"

echo 2. Starting Frontend in new window...
start "CampusCare Frontend (React:3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Application launched!
echo - Frontend: http://localhost:3000
echo - Backend:  http://127.0.0.1:5000/api
echo.
pause
