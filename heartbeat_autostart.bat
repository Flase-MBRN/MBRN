@echo off
title MBRN Heartbeat Monitor - System Watchdog
color 0A
setlocal EnableDelayedExpansion

REM =============================================================================
REM MBRN Heartbeat Monitor - The Phoenix
REM Zweck: Überwacht Python-Prozesse alle 5 Minuten, schreibt Heartbeat-Log
REM =============================================================================

REM Get script directory (portable path resolution)
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Initialize paths
set "LOG_DIR=%SCRIPT_DIR%logs"
set "HEARTBEAT_FILE=%LOG_DIR%\heartbeat.txt"
set "PID_FILE=%LOG_DIR%\monitor.pid"

REM Create logs directory if missing
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Write PID file for process management
echo %~nx0 running with PID %PID% > "%PID_FILE%"

:MAIN_LOOP
echo.
echo ========================================================
echo  MBRN HEARTBEAT MONITOR - %date% %time%
echo ========================================================
echo.

REM Check for Python processes (collector, sentiment, LLM worker)
set "PYTHON_COUNT=0"
set "COLLECTOR_RUNNING=0"
set "SENTIMENT_RUNNING=0"
set "LLM_WORKER_RUNNING=0"
set "DAEMON_RUNNING=0"

REM Count Python processes and identify which pipelines are running
tasklist /FI "IMAGENAME eq python.exe" 2>nul | find /C "python.exe" > nul
if %ERRORLEVEL% EQU 0 (
    for /f %%i in ('tasklist /FI "IMAGENAME eq python.exe" 2^>nul ^| find /C "python.exe"') do set "PYTHON_COUNT=%%i"
)

REM Check for specific pipeline processes by window title
tasklist /FI "WINDOWTITLE eq *raw_market_news_collector*" 2>nul | find "python.exe" > nul
if %ERRORLEVEL% EQU 0 set "COLLECTOR_RUNNING=1"

tasklist /FI "WINDOWTITLE eq *market_sentiment*" 2>nul | find "python.exe" > nul
if %ERRORLEVEL% EQU 0 set "SENTIMENT_RUNNING=1"

tasklist /FI "WINDOWTITLE eq *llm_enrichment*" 2>nul | find "python.exe" > nul
if %ERRORLEVEL% EQU 0 set "LLM_WORKER_RUNNING=1"

tasklist /FI "WINDOWTITLE eq *sentinel_daemon*" 2>nul | find "python.exe" > nul
if %ERRORLEVEL% EQU 0 set "DAEMON_RUNNING=1"

REM Build status string
set "STATUS=SYSTEM_ONLINE"
if %PYTHON_COUNT% EQU 0 set "STATUS=SYSTEM_OFFLINE"

REM Write heartbeat timestamp
(
echo ========================================================
echo HEARTBEAT: %date% %time%
echo STATUS: %STATUS%
echo PYTHON_PROCESSES: %PYTHON_COUNT%
echo COLLECTOR: %COLLECTOR_RUNNING%
echo SENTIMENT: %SENTIMENT_RUNNING%
echo LLM_WORKER: %LLM_WORKER_RUNNING%
echo DAEMON: %DAEMON_RUNNING%
echo ========================================================
) >> "%HEARTBEAT_FILE%"

REM Display status
echo [OK] Heartbeat recorded at: %date% %time%
echo [INFO] Python processes running: %PYTHON_COUNT%
echo [INFO] Collector: %COLLECTOR_RUNNING% ^| Sentiment: %SENTIMENT_RUNNING% ^| LLM: %LLM_WORKER_RUNNING% ^| Daemon: %DAEMON_RUNNING%
echo [INFO] Log: %HEARTBEAT_FILE%

REM Check if all critical components are running
if %PYTHON_COUNT% EQU 0 (
    echo [WARN] No Python processes detected! System may be offline.
    (
        echo [WARN] %date% %time% - No Python processes detected
    ) >> "%HEARTBEAT_FILE%"
)

REM Wait 5 minutes before next check
echo.
echo [INFO] Next check in 5 minutes...
timeout /T 300 /NOBREAK > nul

goto MAIN_LOOP
