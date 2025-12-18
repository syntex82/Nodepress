@echo off
REM ═══════════════════════════════════════════════════════════════════════════════
REM WordPress Node CMS - Windows Setup Batch File
REM Works on Windows 11 and Windows Server
REM This batch file launches the PowerShell setup script with proper permissions
REM ═══════════════════════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo ERROR: This script requires Administrator privileges
    echo ═══════════════════════════════════════════════════════════════
    echo.
    echo Please right-click on this file and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0
set APP_DIR=%SCRIPT_DIR%..

echo.
echo ═══════════════════════════════════════════════════════════════
echo       WordPress Node CMS - Windows Setup
echo ═══════════════════════════════════════════════════════════════
echo.
echo Launching PowerShell setup script...
echo.

REM Run the PowerShell script with proper execution policy
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%windows-setup.ps1"

if %errorLevel% equ 0 (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo Setup completed successfully!
    echo ═══════════════════════════════════════════════════════════════
    echo.
) else (
    echo.
    echo ═══════════════════════════════════════════════════════════════
    echo Setup failed with error code: %errorLevel%
    echo ═══════════════════════════════════════════════════════════════
    echo.
)

pause

