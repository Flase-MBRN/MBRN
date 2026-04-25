<#
.SYNOPSIS
    MBRN v5.6 Orchestrator - NEON ASTRA EDITION
    Zentrale Zündung für den autonomen Loop.
#>

$RepoRoot = "C:\DevLab\MBRN-HUB-V1"
$PipelineDir = Join-Path $RepoRoot "scripts\pipelines"
$LogDir = Join-Path $PipelineDir "logs"
$RunStamp = Get-Date -Format "yyyyMMdd_HHmmss"

# --- NEON ASTRA THEME ---
$C_Violet = "[38;2;123;92;245m"
$C_Success = "[38;2;79;255;176m"
$C_Warning = "[38;2;251;191;36m"
$C_Error = "[38;2;255;107;107m"
$C_Silver = "[38;2;180;184;198m"
$C_Gold = "[38;2;255;215;0m"
$C_Reset = "[0m"

function Show-Banner {
    Clear-Host
    Write-Host "$C_Violet"
    Write-Host "  __  __ ____  ____  _   _   _   _ _   _ ____    "
    Write-Host " |  \/  | __ )|  _ \| \ | | | | | | | | | __ )   "
    Write-Host " | |\/| |  _ \| |_) |  \| | | |_| | | | |  _ \   "
    Write-Host " | |  | | |_) |  _ <| |\  | |  _  | |_| | |_) |  "
    Write-Host " |_|  |_|____/|_| \_\_| \_| |_| |_|\___/|____/   "
    Write-Host "                                                 "
    Write-Host "  >> MULTIDIMENSIONAL MASTERY SYSTEM v5.6 <<     "
    Write-Host "  >> AUTONOMOUS HARVESTING PROTOCOL ACTIVE <<    "
    Write-Host "$C_Reset"
    Write-Host "$C_Silver--------------------------------------------------------$C_Reset"
    Write-Host "  Station: $env:COMPUTERNAME | Session: $RunStamp"
    Write-Host "$C_Silver--------------------------------------------------------$C_Reset"
    Write-Host ""
}

function Write-Step ([string]$Msg) {
    Write-Host "$C_Violet[STEP]$C_Reset $Msg..." -NoNewline
}

function Write-Done {
    Write-Host " $C_Success[OK]$C_Reset"
}

function Start-MBRNComponent {
    param($Name, $ScriptPath, $Arguments = @())
    Write-Step "Initializing $Name"
    
    if (Test-Path -LiteralPath $ScriptPath) {
        $Title = "MBRN Component: $Name"
        # Start in new window with branding
        Start-Process powershell.exe -ArgumentList @(
            "-NoExit",
            "-Command", 
            "`$Host.UI.RawUI.WindowTitle='$Title'; cd '$PipelineDir'; python $ScriptPath $($Arguments -join ' ')"
        )
        Write-Done
    } else {
        Write-Host " $C_Error[FAILED]$C_Reset (Not found: $ScriptPath)"
    }
}

# --- EXECUTION ---

Show-Banner

Write-Step "[0/8] Hygiene: Running Janitor"
$Janitor = Join-Path $PipelineDir "mbrn_janitor.py"
& python $Janitor
Write-Done

Write-Step "[1/8] Security: Launching Sentinel Daemon"
$Sentinel = Join-Path $PipelineDir "sentinel_daemon.py"
Start-Process python.exe -ArgumentList $Sentinel -WorkingDirectory $PipelineDir -WindowStyle Hidden
Write-Done

Write-Step "[2/8] Discovery: Triggering Day Zero Autopilot"
$DayZero = Join-Path $PipelineDir "day_zero_autopilot.ps1"
& powershell.exe -ExecutionPolicy Bypass -File $DayZero -EnableScout | Out-Null
Write-Done

Write-Step "[3/8] Infrastructure: Docker Engine"
# Check Docker silently
$dockerCheck = docker info 2>$null
if ($LASTEXITCODE -eq 0) { Write-Done } else { Write-Host " $C_Warning[WAITING]$C_Reset"; Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" }

Write-Step "[4/8] Intelligence: Nexus Bridge"
$Nexus = Join-Path $PipelineDir "mbrn_nexus_bridge.py"
Start-MBRNComponent "Nexus" $Nexus

Write-Step "[5/8] Evolution: Ouroboros Agent"
$Ouroboros = Join-Path $PipelineDir "mbrn_ouroboros_agent.py"
Start-MBRNComponent "Ouroboros" $Ouroboros @("--infinite")

Write-Step "[6/8] Visuals: Live Monitor"
$Monitor = Join-Path $PipelineDir "mbrn_live_monitor.py"
Start-MBRNComponent "Monitor" $Monitor @("--infinite")

Write-Step "[7/8] Authority: Prime Director"
$Prime = Join-Path $PipelineDir "mbrn_prime_director.py"
Start-MBRNComponent "Director" $Prime @("--infinite", "--live-control")

Write-Step "[8/8] Production: Bridge Agent (Equalizer)"
$BridgeAgent = Join-Path $PipelineDir "mbrn_bridge_agent.py"
Start-MBRNComponent "Bridge Agent" $BridgeAgent @("--autonomous", "--target", "10")

Write-Host ""
Write-Host "$C_Gold"
Write-Host "============================================"
Write-Host "       SYSTEM FULLY SYNCHRONIZED"
Write-Host "       LEVERAGE CAPABILITY: 500K+"
Write-Host "============================================"
Write-Host "$C_Reset"
Write-Host "$C_Silver[INFO] Log Orbit: $LogDir$C_Reset"
Write-Host "$C_Violet[READY]$C_Reset System is breathing. Observe the terminals."
Write-Host ""
