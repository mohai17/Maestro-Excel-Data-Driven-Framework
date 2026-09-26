:: Maestro Excel Data Driven Framework
:: Copyright 2026 Md. Mohai Minul Islam
:: Licensed under Apache License 2.0

@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo  Step 0: Checking and Installing Dependencies...
echo ===================================================
:: Checks if json-server exists inside node_modules
if not exist "node_modules\json-server\" (
    echo [INFO] Dependencies or json-server missing. Installing node packages...
    call npm install json-server
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [FATAL ERROR] npm install failed. Check your internet connection or Node environment.
        pause
        exit /b %ERRORLEVEL%
    )
) else (
    echo [INFO] Dependencies verified. Skipping npm install.
)

echo.
echo ===================================================
echo  Step 1: Converting Excel to JSON...
echo ===================================================
node Config\convert.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [FATAL ERROR] Data conversion failed. Aborting test execution.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo  Step 1.5: Starting JSON Server...
echo ===================================================
:: Kill any previous process running on port 8080
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do taskkill /F /PID %%a >nul 2>&1

:: Starts server.js in the background
start /B node Config\server.js

:: Give server 2 seconds to load files and bind to port 8080
timeout /t 2 /nobreak >nul

echo.
echo ===================================================
echo  Step 1.6: Generating Dynamic Maestro Setup Scripts...
echo ===================================================
set "JSON_FOLDER=%~dp0JsonData"
set "SCRIPT_FOLDER=%~dp0Scripts"

if not exist "%SCRIPT_FOLDER%" mkdir "%SCRIPT_FOLDER%"

:: Recursively scan JsonData and create matching JS setup scripts in Scripts directory
for /R "%JSON_FOLDER%" %%F in (*.json) do (
    set "FILE_NAME=%%~nF"
    set "CURRENT_DIR=%%~dpF"
    
    :: Extract subfolder path relative to JsonData for folder structure creation
    set "REL_PATH=!CURRENT_DIR:%JSON_FOLDER%=!"
    set "TARGET_DIR=%SCRIPT_FOLDER%!REL_PATH!"
    
    if not exist "!TARGET_DIR!" mkdir "!TARGET_DIR!"
    
    set "OUTPUT_FILE=!TARGET_DIR!!FILE_NAME!.js"

    :: Endpoint using only the filename
    set "HTTP_URL=http://localhost:8080/!FILE_NAME!"

    echo Generating setup script: !TARGET_DIR!!FILE_NAME!.js
    
    (
        echo // Auto-generated setup file for !FILE_NAME!
        echo var response = http.get('!HTTP_URL!'^);
        echo var data = response ^&^& response.body ? JSON.parse(response.body^) : [];
        echo.
        echo var index = typeof ROW_NO ^^!= 'undefined' ? parseInt(ROW_NO, 10^) - 1 : 0;
        echo var row = Array.isArray(data^) ? data[index] : null;
        echo.
        echo if (row^) {
        echo   Object.keys(row^).forEach(function(key^) {
        echo     output[key] = row[key] ^^!= null ? String(row[key]^) : "";
        echo   }^);
        echo }
    ) > "!OUTPUT_FILE!"
)

:: Ensure output reports directory exists
if not exist "Reports" mkdir Reports