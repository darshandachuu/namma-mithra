@echo off
title CampusCare Backend Server (Flask)
echo ========================================================
echo   Starting CampusCare Flask REST API Backend Server
echo   Port: 5000 (http://127.0.0.1:5000)
echo ========================================================
echo.
cd /d "%~dp0backend"
python run.py
pause
