<#
.SYNOPSIS
    MBRN v5.6 Orchestrator - PM2 Launcher (Canonical)
    LAW 8 OPS EXCEPTION: PM2 is the single source of ops truth.

    Dieses Skript startet NICHT direkt Python-Prozesse.
    Es delegiert 100% an PM2 via ecosystem.config.cjs.
#>

$RepoRoot = "C:\DevLab\MBRN-HUB-V1"

# --- NEON ASTRA THEME ---
$C_Violet = "`e[38;2;123;92;245m"
$C_Success = "`e[38;2;79;255;176m"
$C_Silver = "`e[38;2;180;184;198m"
$C_Gold = "`e[38;2;255;215;0m"
$C_Reset = "`e[0m"

function Show-Banner {
    Clear-Host
    Write-Host "$C_Violet"
    Write-Host "  __  __ ____  ____  _   _   _   _ _   _ ____    "
    Write-Host " |  \/  | __ )|  _ \| \ | | | | | | | | | __ )   "
    Write-Host " | |\/| |  _ \| |_) |  \| | | |_| | | | |  _ \   "
    Write-Host " | |  | | |_) |  _ <| |\  | |  _  | |_| | |_) |  "
    Write-Host " |_|  |_|____/|_| \_\_| \_| |_| |_|\___/|____/   "
    Write-Host "                                                 "
    Write-Host '  >> PM2 ORCHESTRATOR - LAW 8 EXCEPTION >>       '
    Write-Host '  >> Single Source of Ops Truth: PM2 >>          '
    Write-Host "$C_Reset"
    Write-Host "$($C_Silver)-----------------------------------------------$($C_Reset)"
    Write-Host "  Station: $env:COMPUTERNAME | Mode: PM2 Canonical"
    Write-Host "$($C_Silver)-----------------------------------------------$($C_Reset)"
    Write-Host ""
}

Show-Banner

Write-Host "$($C_Violet)[INIT]$($C_Reset) Starting PM2 Ecosystem..." -NoNewline

Set-Location $RepoRoot

# LAW 8 OPS EXCEPTION: PM2 ist der kanonische Orchestrator
Write-Host "$($C_Silver)[CLEAN]$($C_Reset) Wiping old process list..."
pm2 delete all
Write-Host "$($C_Silver)[START]$($C_Reset) Loading ecosystem.config.cjs..."
pm2 start ecosystem.config.cjs
Write-Host "$($C_Silver)[SAVE]$($C_Reset) Persisting clean state..."
pm2 save

Write-Host " $($C_Success)[OK]$($C_Reset)"
Write-Host ""
Write-Host "$C_Gold"
Write-Host "============================================"
Write-Host "       PM2 ECOSYSTEM ACTIVE"
Write-Host "       All Python processes managed by PM2"
Write-Host "============================================"
Write-Host "$C_Reset"
Write-Host ""
Write-Host "$($C_Silver)[INFO]$($C_Reset) Commands:"
Write-Host "  pm2 status     - View all processes"
Write-Host "  pm2 logs       - View unified logs"
Write-Host "  pm2 stop all   - Stop all services"
Write-Host "  pm2 save       - Save process list for autostart"
Write-Host ""
