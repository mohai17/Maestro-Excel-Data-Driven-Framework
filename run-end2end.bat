:: Maestro Excel Data Driven Framework
:: Copyright 2026 Md. Mohai Minul Islam
:: Licensed under Apache License 2.0


@echo off
setlocal EnableDelayedExpansion

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
        echo(
        echo var index = typeof ROW_NO ^^!= 'undefined' ? parseInt(ROW_NO, 10^) - 1 : 0;
        echo var row = Array.isArray(data^) ? data[index] : null;
        echo(
        echo if (row^) {
        echo   Object.keys(row^).forEach(function(key^) {
        echo     output[key] = row[key] ^^!= null ? String(row[key]^) : "";
        echo   }^);
        echo }
    ) > "!OUTPUT_FILE!"
)

:: Ensure output reports directory exists
if not exist "Reports" mkdir Reports

@echo off
setlocal EnableDelayedExpansion

echo.
echo ===================================================
echo Step 2: Executing Maestro Test Suite and Generating Report...
echo ===================================================

if not exist "Flows" (
    echo [FATAL ERROR] 'Flows' folder not found.
    pause
    exit /b 1
)

@echo off
setlocal EnableDelayedExpansion

rem Create folders

if not exist "Reports" mkdir "Reports"
if not exist "Reports\Drafts" mkdir "Reports\Drafts"

rem Cleanup old reports

del /q "Reports\Drafts\*.html" 2>nul
del /q "Status.csv" 2>nul

echo Flow,Dataset,Row,Report>Status.csv

for %%Y in (Flows\*.yaml) do (

    set "DATASET="
    set "COUNT=0"

    echo.
    echo ===================================================
    echo Processing Flow: %%~nxY
    echo ===================================================

    rem Find runScript line

    for /f "usebackq delims=" %%L in ("%%Y") do (

        echo %%L | findstr /i "runScript:" >nul

        if !errorlevel! equ 0 (

            set "LINE=%%L"
            set "LINE=!LINE:*runScript:=!"
            set "LINE=!LINE:"=!"

            for %%F in ("!LINE!") do (
                set "DATASET=%%~nF"
            )
        )
    )

    if defined DATASET (

        for /f %%C in ('
            powershell -NoProfile -Command "try{(Invoke-RestMethod http://localhost:8080/!DATASET!).Count}catch{0}"
        ') do (
            set "COUNT=%%C"
        )

        echo Dataset Name : !DATASET!
        echo Total Rows   : !COUNT!

        if "!COUNT!"=="0" (

            echo [WARNING] No records found for !DATASET!

        ) else (

            for /L %%R in (1,1,!COUNT!) do (

                echo.
                echo ---------------------------------------------------
                echo Running Flow=%%~nxY Row=%%R/!COUNT!
                echo ---------------------------------------------------

                set "REPORT=Reports\Drafts\%%~nY_Row%%R.html"

                call maestro test "%%Y" ^
                    -e ROW_NO=%%R ^
                    --format html-detailed ^
                    --output "!REPORT!"

                if !ERRORLEVEL! NEQ 0 (
                    echo [WARNING] Failed: %%~nxY Row=%%R
                )

                echo %%~nxY,!DATASET!,%%R,%%~nY_Row%%R.html>>Status.csv
            )
        )

    ) else (

        echo [WARNING] No runScript found in %%~nxY

    )
)

@echo off
setlocal EnableDelayedExpansion

echo.
echo ============================================
echo Generating Combined Report...
echo ============================================

rem Base folders

set "BASE_DIR=%~dp0"
set "CONFIG_FOLDER=%BASE_DIR%Config"
set "DRAFT_REPORT_FOLDER=%BASE_DIR%Reports\Drafts"
set "FINAL_REPORT=%BASE_DIR%Reports\Combined_Report.html"

echo DRAFT_REPORT_FOLDER=%DRAFT_REPORT_FOLDER%
echo CONFIG_FOLDER=%CONFIG_FOLDER%

rem Check generator

if not exist "%CONFIG_FOLDER%\report-generator.js" (
    echo ERROR: report-generator.js not found
    echo Expected:
    echo %CONFIG_FOLDER%\report-generator.js
    pause
    exit /b 1
)

rem Show generated draft reports

dir "%DRAFT_REPORT_FOLDER%\*.html"

rem Generate combined report

node "%CONFIG_FOLDER%\report-generator.js" "%DRAFT_REPORT_FOLDER%"

rem Validate final report

if not exist "%FINAL_REPORT%" (
    echo.
    echo ============================================
    echo ERROR: Combined Report was not generated
    echo Expected:
    echo %FINAL_REPORT%
    echo ============================================
    pause
    exit /b 1
)

echo.
echo ============================================
echo Combined Report Generated Successfully
echo ============================================
echo %FINAL_REPORT%

start "" "%FINAL_REPORT%"

echo.
echo ============================================
echo Test Execution Completed
echo ============================================

pause


