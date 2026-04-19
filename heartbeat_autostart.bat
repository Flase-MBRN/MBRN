@echo off
setlocal

REM === Passe diesen Pfad an dein Projekt an ===
set "PROJECT_DIR=C:\DevLab\MBRN-HUB-V1"

set "PYTHON_EXE=%PROJECT_DIR%\scripts\pipelines\venv\Scripts\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=python"

powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command ^
  "Start-Process -WindowStyle Hidden -FilePath '%PYTHON_EXE%' -ArgumentList '\"%PROJECT_DIR%\\heartbeat.py\"' -WorkingDirectory '%PROJECT_DIR%'"

endlocal
exit /b 0
