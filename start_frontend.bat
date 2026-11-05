@echo off
title CampusCare Frontend Server (React + Vite)
echo ========================================================
echo   Starting CampusCare React Client Dev Server
echo   Port: 3000 (http://localhost:3000)
echo ========================================================
echo.
cd /d "%~dp0frontend"
npm run dev
pause
