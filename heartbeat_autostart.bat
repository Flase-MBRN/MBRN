@echo off
setlocal

REM Dynamische Pfaderkennung (erkennt automatisch, wo die .bat liegt)
set "PROJECT_DIR=%~dp0"
REM Entfernt den letzten Backslash für saubere Pfade
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

set "PYTHON_EXE=%PROJECT_DIR%\scripts\pipelines\venv\Scripts\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=python"

REM PowerShell startet das Skript im ultimativen Stealth-Modus
powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command ^
  "Start-Process -WindowStyle Hidden -FilePath '%PYTHON_EXE%' -ArgumentList '\"%PROJECT_DIR%\heartbeat.py\"' -WorkingDirectory '%PROJECT_DIR%'"

endlocal
exit /b 0