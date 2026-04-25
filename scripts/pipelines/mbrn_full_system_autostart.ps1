param(
    [switch]$SkipDayZero,
    [switch]$EnableExperimentalTools
)

$ErrorActionPreference = "Continue"

$RepoRoot = "C:\DevLab\MBRN-HUB-V1"
$PipelineDir = Join-Path $RepoRoot "scripts\pipelines"
$Python = Join-Path $RepoRoot "venv\Scripts\python.exe"
$DayZero = Join-Path $PipelineDir "day_zero_autopilot.ps1"
$Sentinel = Join-Path $PipelineDir "sentinel_daemon.py"
$Nexus = Join-Path $PipelineDir "mbrn_nexus_bridge.py"
$Ouroboros = Join-Path $PipelineDir "mbrn_ouroboros_agent.py"
$Monitor = Join-Path $PipelineDir "mbrn_live_monitor.py"
$Prime = Join-Path $PipelineDir "mbrn_prime_director.py"
$Archivist = Join-Path $PipelineDir "mbrn_archivist.py"
$Toolmaker = Join-Path $PipelineDir "mbrn_toolmaker.py"
$LockPath = Join-Path $env:TEMP "mbrn_full_system_autostart.lock"

if (-not (Test-Path -LiteralPath $Python)) {
    $Python = "python"
}

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host $Message
}

function Test-PythonComponent {
    param([string]$Pattern)
    $procMatches = Get-CimInstance Win32_Process -Filter "name = 'python.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -like "*$Pattern*" }
    return [bool]$procMatches
}

function Start-PythonComponent {
    param(
        [string]$Name,
        [string]$ScriptPath,
        [string[]]$Arguments = @()
    )

    $pattern = Split-Path -Leaf $ScriptPath
    if (Test-PythonComponent $pattern) {
        Write-Host "[OK] $Name already running, skipping start"
        return
    }

    if (-not (Test-Path -LiteralPath $ScriptPath)) {
        Write-Host "[WARN] $Name not found: $ScriptPath"
        return
    }

    $argList = @($ScriptPath) + $Arguments
    Start-Process -FilePath $Python -ArgumentList $argList -WindowStyle Minimized
    Write-Host "[OK] $Name started"
    Start-Sleep -Seconds 2
}

function Wait-Docker {
    $maxWaitSeconds = 60
    $waited = 0
    while ($waited -lt $maxWaitSeconds) {
        docker info *> $null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Docker Engine is READY"
            return
        }
        $waited += 5
        Write-Host "[..] Docker not ready yet, waiting 5s... ($waited/$maxWaitSeconds)"
        Start-Sleep -Seconds 5
    }
    Write-Host "[WARN] Docker not ready after ${maxWaitSeconds}s. Continuing without Docker readiness confirmation."
}

Write-Host ""
Write-Host "============================================"
Write-Host "  MBRN FULL SYSTEM - Initializing..."
Write-Host "============================================"

$lockStream = $null
try {
    try {
        $lockStream = [System.IO.File]::Open($LockPath, "OpenOrCreate", "ReadWrite", "None")
    } catch {
        Write-Host "[WARN] Another MBRN autostart launcher is already running. Exiting duplicate launcher."
        exit 0
    }

    Write-Step "[0/8] System Hygiene (Janitor)"
    $Janitor = Join-Path $PipelineDir "mbrn_janitor.py"
    & $Python $Janitor

    Write-Step "[1/8] Starting Sentinel Daemon"
    Start-PythonComponent -Name "Sentinel" -ScriptPath $Sentinel

    Write-Step "[2/8] Running Day Zero Autopilot"
    if ($SkipDayZero) {
        Write-Host "[OK] Day Zero skipped by flag"
    } elseif (Test-Path -LiteralPath $DayZero) {
        & powershell.exe -ExecutionPolicy Bypass -File $DayZero -EnableScout
    } else {
        Write-Host "[ERROR] Day Zero script not found: $DayZero"
        exit 1
    }

    Write-Step "[3/8] Checking Docker Engine"
    Wait-Docker

    Write-Step "[4/8] Starting Nexus"
    Start-PythonComponent -Name "Nexus" -ScriptPath $Nexus

    Write-Step "[5/8] Starting Ouroboros"
    Start-PythonComponent -Name "Ouroboros" -ScriptPath $Ouroboros -Arguments @("--infinite")

    Write-Step "[6/8] Starting Live Monitor"
    Start-PythonComponent -Name "Live Monitor" -ScriptPath $Monitor -Arguments @("--infinite")

    Write-Step "[7/8] Starting Prime Director"
    Start-PythonComponent -Name "Prime Director" -ScriptPath $Prime -Arguments @("--infinite", "--live-control")

    Write-Step "[8/8] Starting Bridge Agent (Equalizer v5.5)"
    $BridgeAgent = Join-Path $PipelineDir "mbrn_bridge_agent.py"
    Start-PythonComponent -Name "Bridge Agent" -ScriptPath $BridgeAgent -Arguments @("--autonomous", "--target", "10")

    if ($EnableExperimentalTools) {
        Write-Step "[optional] Starting non-canonical experimental tools"
        Start-PythonComponent -Name "Archivist" -ScriptPath $Archivist -Arguments @("--infinite")
        Start-PythonComponent -Name "Toolmaker" -ScriptPath $Toolmaker -Arguments @("--infinite")
    } else {
        Write-Host "[OK] Non-canonical experimental tools skipped (Archivist, Toolmaker)"
    }

    Write-Host ""
    Write-Host "============================================"
    Write-Host "  MBRN FULL SYSTEM ONLINE"
    Write-Host "============================================"
    Write-Host "[INFO] Factory control: $RepoRoot\shared\data\mbrn_factory_control.json"
    Write-Host "[INFO] Prime report:    $RepoRoot\shared\data\mbrn_prime_director_report.json"
    Write-Host "[INFO] Dashboard:       http://localhost:8080/dashboard/index.html"
} finally {
    if ($lockStream) {
        $lockStream.Close()
        Remove-Item -LiteralPath $LockPath -Force -ErrorAction SilentlyContinue
    }
}
