@echo off
echo ========================================
echo   PLAYWRIGHT TEST RUNNER (OFFLINE)
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found. Please run this from the project root.
    pause
    exit /b 1
)

echo Checking Node.js installation...
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo Node.js version:
node -v

echo.
echo ========================================
echo   AVAILABLE COMMANDS
echo ========================================
echo.
echo 1. Try npm install (may fail due to network)
echo 2. Check existing dependencies
echo 3. Run tests (if dependencies exist)
echo 4. Open project in VS Code
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Attempting npm install...
    npm install
    if errorlevel 1 (
        echo.
        echo npm install failed. Try the following:
        echo - Connect to personal WiFi
        echo - Configure company proxy
        echo - Use npm install --prefer-offline
    )
    pause
    goto :EOF
)

if "%choice%"=="2" (
    echo.
    echo Checking for node_modules...
    if exist "node_modules\" (
        echo ✅ Root node_modules found
    ) else (
        echo ❌ Root node_modules missing
    )
    
    if exist "booking\booking-tests\node_modules\" (
        echo ✅ Booking tests node_modules found
    ) else (
        echo ❌ Booking tests node_modules missing
    )
    
    echo.
    echo Checking package-lock.json...
    if exist "package-lock.json" (
        echo ✅ Root package-lock.json exists
    )
    if exist "booking\booking-tests\package-lock.json" (
        echo ✅ Booking package-lock.json exists
    )
    pause
    goto :EOF
)

if "%choice%"=="3" (
    echo.
    echo Attempting to run tests...
    if exist "node_modules\" (
        echo Running from root...
        npx playwright test --reporter=list
    ) else if exist "booking\booking-tests\node_modules\" (
        echo Running from booking-tests...
        cd booking\booking-tests
        npx playwright test --reporter=list
        cd ..\..
    ) else (
        echo ERROR: No node_modules found. Run npm install first.
    )
    pause
    goto :EOF
)

if "%choice%"=="4" (
    echo Opening in VS Code...
    code .
    goto :EOF
)

if "%choice%"=="5" (
    exit /b 0
)

echo Invalid choice. Please try again.
pause