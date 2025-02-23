@echo off
echo ============================================
echo         Finance Manager Launcher
echo ============================================
echo.

:: Ask if dependencies have been installed
set /p installed="Have you installed all the dependencies for this project? (y/n): "
if /I not "%installed%"=="y" (
    echo.
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo.
        echo ERROR: 'npm install' failed. Please verify your npm installation and try again.
        pause
        exit /b
    )
    echo.
    echo Dependencies installed successfully.
) else (
    echo.
    echo Skipping dependency installation.
)

echo.
:: Ask if the user is ready to run the project
set /p ready="Are you ready to run the project? (y/n): "
if /I "%ready%"=="y" (
    echo.
    echo Copying URL to clipboard: http://localhost:3000
    echo http://localhost:3000| clip
    echo.
    echo You can access the project at:
    echo http://localhost:3000
    echo.
    echo Project By TEAM GEPARD...
    echo (To stop the server, press CTRL+C in this window)
    npm run start
) else (
    echo.
    echo Please run the script again when you are ready.
)
pause 