@echo off
setlocal

REM Dynamische Pfaderkennung
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

REM Pfad zum Python-Motor (VENV bevorzugt)
set "PYTHON_EXE=%PROJECT_DIR%\scripts\pipelines\venv\Scripts\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=python"

REM DER MASTER-MOVE: Startet den Sentinel-Daemon im Hintergrund (Hidden)
powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command ^
  "Start-Process -WindowStyle Hidden -FilePath '%PYTHON_EXE%' -ArgumentList '\"%PROJECT_DIR%\scripts\pipelines\sentinel_daemon.py\"' -WorkingDirectory '%PROJECT_DIR%\scripts\pipelines'"

endlocal
exit /b 0