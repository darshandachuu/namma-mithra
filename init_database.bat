@echo off
echo ========================================================
echo   CampusCare - MySQL 8 Database Initialization Script
echo ========================================================
echo.
set /p MYSQL_USER="Enter MySQL Username [root]: "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PASS="Enter MySQL Password (press Enter if blank): "

echo.
echo Initializing schema...
if "%MYSQL_PASS%"=="" (
    mysql -u %MYSQL_USER% < database\schema.sql
    echo Seeding sample campus data...
    mysql -u %MYSQL_USER% < database\seed_data.sql
) else (
    mysql -u %MYSQL_USER% -p%MYSQL_PASS% < database\schema.sql
    echo Seeding sample campus data...
    mysql -u %MYSQL_USER% -p%MYSQL_PASS% < database\seed_data.sql
)

echo.
echo [CampusCare] MySQL 8 database schema and seeds initialized successfully!
pause
