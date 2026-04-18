@echo off
title MBRN Sentinel Daemon - Background Motor
color 05
echo.
echo ========================================================
echo MBRN SENTINEL DAEMON INITIATED
echo ========================================================
echo.
cd C:\DevLab\MBRN-HUB-V1\scripts\pipelines
python sentinel_daemon.py
pause
