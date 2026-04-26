@echo off
title MBRN Sentinel Daemon - Background Motor
color 05
setlocal EnableDelayedExpansion

REM Get script directory (portable path resolution)
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Initialize logging
set "LOG_DIR=%SCRIPT_DIR%logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set "LOG_FILE=%LOG_DIR%\daemon_startup.log"

echo. >> "%LOG_FILE%" 2>&1
echo ======================================================== >> "%LOG_FILE%" 2>&1
echo  MBRN SENTINEL DAEMON INITIATED >> "%LOG_FILE%" 2>&1
echo  Started at: %date% %time% >> "%LOG_FILE%" 2>&1
echo ======================================================== >> "%LOG_FILE%" 2>&1
echo. >> "%LOG_FILE%" 2>&1

echo.
echo ========================================================
echo  MBRN SENTINEL DAEMON INITIATED
echo  Log: %LOG_FILE%
echo ========================================================
echo.

REM 1. Dynamische Pfad-Findung via SCRIPT_DIR (portabel!)
if exist "sentinel_daemon.py" (
    echo [SYSTEM] Daemon-Skript gefunden in: %SCRIPT_DIR% >> "%LOG_FILE%" 2>&1
) else (
    echo [CRITICAL] sentinel_daemon.py nicht gefunden in: %SCRIPT_DIR% >> "%LOG_FILE%" 2>&1
    echo [CRITICAL] sentinel_daemon.py nicht gefunden!
    pause
    exit /b 1
)

REM 2. Intelligente VENV-Erkennung (Der wichtigste Fix!)
set "PYTHON_EXE=..\..\venv\Scripts\python.exe"
if exist "%PYTHON_EXE%" (
    echo [SYSTEM] Isolierte MBRN-VENV Umgebung gekoppelt... >> "%LOG_FILE%" 2>&1
    echo [SYSTEM] Isolierte MBRN-VENV Umgebung gekoppelt...
) else (
    set "PYTHON_EXE=venv\Scripts\python.exe"
    if exist "!PYTHON_EXE!" (
        echo [SYSTEM] Lokale VENV Umgebung gekoppelt... >> "%LOG_FILE%" 2>&1
        echo [SYSTEM] Lokale VENV Umgebung gekoppelt...
    ) else (
        echo [WARNUNG] Kein lokales VENV gefunden. Nutze globales Python... >> "%LOG_FILE%" 2>&1
        echo [WARNUNG] Kein lokales VENV gefunden. Nutze globales Python...
        set "PYTHON_EXE=python"
    )
)
echo -------------------------------------------------------- >> "%LOG_FILE%" 2>&1
echo --------------------------------------------------------
echo. >> "%LOG_FILE%" 2>&1
echo.

REM 3. HORIZON SCOUT starten (optionaler Hintergrund-Prozess)
REM Prüfe Umgebungsvariable MBRN_ENABLE_SCOUT
if "%MBRN_ENABLE_SCOUT%"=="1" (
    echo [SYSTEM] HORIZON SCOUT aktiviert. Starte Discovery-Agent... >> "%LOG_FILE%" 2>&1
    echo [SYSTEM] HORIZON SCOUT aktiviert. Starte Discovery-Agent...
    
    set "SCOUT_LOG=%LOG_DIR%\horizon_scout_autostart.log"
    echo [SYSTEM] Scout-Log: %SCOUT_LOG% >> "%LOG_FILE%" 2>&1
    
    REM Starte Scout im Hintergrund (neues Fenster, detached)
    start "MBRN Horizon Scout" /MIN cmd /c "cd /d "%SCRIPT_DIR%" && "%PYTHON_EXE%" mbrn_horizon_scout.py --infinite ^>"%SCOUT_LOG%" 2^>^&1"
    
    echo [OK] Horizon Scout gestartet (Scan-Intervall: 60 Minuten) >> "%LOG_FILE%" 2>&1
    echo [OK] Horizon Scout gestartet (Scan-Intervall: 60 Minuten)
    echo. >> "%LOG_FILE%" 2>&1
    echo.
) else (
    echo [INFO] Horizon Scout deaktiviert (setze MBRN_ENABLE_SCOUT=1 zum Aktivieren) >> "%LOG_FILE%" 2>&1
)

REM 4. Motor starten mit Logging
echo [SYSTEM] Starte sentinel_daemon.py... >> "%LOG_FILE%" 2>&1
echo [SYSTEM] Starte sentinel_daemon.py...
"%PYTHON_EXE%" sentinel_daemon.py >> "%LOG_FILE%" 2>&1
set "DAEMON_EXIT=%ERRORLEVEL%"

echo. >> "%LOG_FILE%" 2>&1
echo [CRITICAL] Der Daemon wurde beendet oder ist gecrasht! >> "%LOG_FILE%" 2>&1
echo [CRITICAL] Exit Code: %DAEMON_EXIT% >> "%LOG_FILE%" 2>&1
echo [CRITICAL] Zeit: %date% %time% >> "%LOG_FILE%" 2>&1

echo.
echo [CRITICAL] Der Daemon wurde beendet oder ist gecrasht!
echo [CRITICAL] Exit Code: %DAEMON_EXIT%
echo Siehe Log: %LOG_FILE%
pause