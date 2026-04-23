@echo off
title MBRN Sentinel Daemon - Background Motor
color 05

echo.
echo ========================================================
echo  MBRN SENTINEL DAEMON INITIATED
echo ========================================================
echo.

REM 1. Dynamische Pfad-Findung (Egal wo die .bat gestartet wird)
if exist "scripts\pipelines\sentinel_daemon.py" (
    cd scripts\pipelines
) else if exist "sentinel_daemon.py" (
    REM Wir sind bereits im richtigen Ordner
) else (
    REM Fallback
    cd /d C:\DevLab\MBRN-HUB-V1\scripts\pipelines
)

REM 2. Intelligente VENV-Erkennung (Der wichtigste Fix!)
set "PYTHON_EXE=venv\Scripts\python.exe"
if exist "%PYTHON_EXE%" (
    echo [SYSTEM] Isolierte MBRN-VENV Umgebung gekoppelt...
) else (
    echo [WARNUNG] Kein lokales VENV gefunden. Nutze globales Python...
    set "PYTHON_EXE=python"
)
echo --------------------------------------------------------
echo.

REM 3. Motor starten
"%PYTHON_EXE%" sentinel_daemon.py

echo.
echo [CRITICAL] Der Daemon wurde beendet oder ist gecrasht!
pause