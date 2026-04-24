param(
  [string]$RepoRoot = "C:\DevLab\MBRN-HUB-V1",
  [int]$DefaultLlmLimit = 10,
  [switch]$DryRun,
  [switch]$EnableScout
)

$ErrorActionPreference = "Stop"

$PipelineDir = Join-Path $RepoRoot "scripts\pipelines"
$EnvPath = Join-Path $PipelineDir ".env"
$LogDir = Join-Path $PipelineDir "logs"
$RunStamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$LogFile = Join-Path $LogDir "day_zero_autopilot_$RunStamp.log"

function Write-DayZeroLog {
  param(
    [string]$Level,
    [string]$Message
  )

  $line = "[{0}] [{1}] {2}" -f (Get-Date -Format "o"), $Level, $Message
  Add-Content -Path $LogFile -Value $line
  Write-Host $line
}

function Wait-OllamaReady {
  param(
    [int]$TimeoutSeconds = 30,
    [string]$OllamaUrl = "http://localhost:11434/api/tags"
  )

  Write-DayZeroLog "INFO" "Waiting for Ollama to be ready (timeout=${TimeoutSeconds}s)..."
  $startTime = Get-Date

  while ($true) {
    try {
      $response = Invoke-WebRequest -Uri $OllamaUrl -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
      if ($response.StatusCode -eq 200) {
        Write-DayZeroLog "OK" "Ollama is ready and responding"
        return $true
      }
    } catch {
      # Ollama not ready yet, continue waiting
    }

    $elapsed = (Get-Date) - $startTime
    if ($elapsed.TotalSeconds -ge $TimeoutSeconds) {
      Write-DayZeroLog "WARN" "Ollama readiness check timed out after ${TimeoutSeconds}s. Proceeding anyway..."
      return $false
    }

    Start-Sleep -Milliseconds 500
  }
}

function Get-DotEnvValue {
  param(
    [string]$Path,
    [string]$Key
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return $null
  }

  foreach ($line in Get-Content -LiteralPath $Path) {
    $trimmed = $line.Trim()
    if (-not $trimmed -or $trimmed.StartsWith("#")) {
      continue
    }

    $parts = $trimmed.Split("=", 2)
    if ($parts.Count -ne 2) {
      continue
    }

    if ($parts[0].Trim() -eq $Key) {
      return $parts[1].Trim().Trim('"').Trim("'")
    }
  }

  return $null
}

function Resolve-PythonExecutable {
  $venvPython = Join-Path $PipelineDir "venv\Scripts\python.exe"
  if (Test-Path -LiteralPath $venvPython) {
    return $venvPython
  }

  $globalPython = Get-Command "python" -ErrorAction SilentlyContinue
  if ($globalPython) {
    return "python"
  }

  return $null
}

function Invoke-PipelineStep {
  param(
    [string]$Name,
    [string[]]$Arguments
  )

  $commandPreview = "$PythonExe $($Arguments -join ' ')"
  Write-DayZeroLog "INFO" "Starting $Name command=$commandPreview"

  if ($DryRun) {
    Write-DayZeroLog "INFO" "Dry run enabled; skipped $Name"
    return 0
  }

  & $PythonExe @Arguments 2>&1 | ForEach-Object {
    Add-Content -Path $LogFile -Value $_
    Write-Host $_
  }
  $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }
  Write-DayZeroLog "INFO" "$Name finished exit_code=$exitCode"
  return $exitCode
}

function Start-HorizonScout {
  param(
    [string]$PythonExecutable,
    [string]$PipelineDirectory
  )

  $scoutLogFile = Join-Path $LogDir "horizon_scout_$RunStamp.log"
  $scoutScript = Join-Path $PipelineDirectory "mbrn_horizon_scout.py"

  if (-not (Test-Path -LiteralPath $scoutScript)) {
    Write-DayZeroLog "WARN" "Horizon Scout script not found at $scoutScript"
    return $null
  }

  Write-DayZeroLog "INFO" "Starting Horizon Scout in background mode"
  Write-DayZeroLog "INFO" "Scout log: $scoutLogFile"

  if ($DryRun) {
    Write-DayZeroLog "INFO" "Dry run enabled; skipped Scout start"
    return $null
  }

  try {
    # Start Scout in background with loop mode
    $scoutProcess = Start-Process -FilePath $PythonExecutable `
      -ArgumentList @($scoutScript, "--infinite") `
      -WorkingDirectory $PipelineDirectory `
      -RedirectStandardOutput $scoutLogFile `
      -RedirectStandardError $scoutLogFile `
      -WindowStyle Hidden `
      -PassThru

    Write-DayZeroLog "OK" "Horizon Scout started with PID=$($scoutProcess.Id)"
    return $scoutProcess
  } catch {
    Write-DayZeroLog "WARN" "Failed to start Horizon Scout: $($_.Exception.Message)"
    return $null
  }
}

# =============================================================================
# MISSION CONTROL HUB (Level 3) - Browser & Log Monitoring
# =============================================================================

function Launch-MissionControl {
  param(
    [string]$RepoRoot,
    [string]$LogDir
  )
  
  Write-DayZeroLog "INFO" "Launching Mission Control Hub (Level 3)..."
  
  # Tab 1: Lokales Dashboard (file://)
  $dashboardPath = Join-Path $RepoRoot "dashboard\index.html"
  if (Test-Path -LiteralPath $dashboardPath) {
    $dashboardUrl = "file:///$($dashboardPath -replace '\\', '/')"
    try {
      Start-Process $dashboardUrl
      Write-DayZeroLog "OK" "Dashboard opened: $dashboardUrl"
    } catch {
      Write-DayZeroLog "WARN" "Failed to open dashboard: $($_.Exception.Message)"
    }
  } else {
    Write-DayZeroLog "WARN" "Dashboard not found at $dashboardPath"
  }
  
  # Tab 2: Supabase Console (User provided URL) - Dashboard URL (not API endpoint)
  $supabaseUrl = "https://supabase.com/dashboard/project/wqfijgzlxypqftwwoxxp"
  try {
    Start-Process $supabaseUrl
    Write-DayZeroLog "OK" "Supabase Console opened: $supabaseUrl"
  } catch {
    Write-DayZeroLog "WARN" "Failed to open Supabase: $($_.Exception.Message)"
  }
  
  # Tab 3: GitHub Repo (User provided URL)
  $githubUrl = "https://github.com/Flase-MBRN/MBRN"
  try {
    Start-Process $githubUrl
    Write-DayZeroLog "OK" "GitHub Repo opened: $githubUrl"
  } catch {
    Write-DayZeroLog "WARN" "Failed to open GitHub: $($_.Exception.Message)"
  }
}

function Start-LiveLogMonitor {
  param(
    [string]$LogDir
  )
  
  Write-DayZeroLog "INFO" "Starting Live Log Monitor (Matrix-Style)..."
  
  # Find latest scout log
  $scoutLogs = Get-ChildItem -Path "$LogDir\horizon_scout_*.log" -ErrorAction SilentlyContinue | 
               Sort-Object LastWriteTime -Descending | 
               Select-Object -First 1
  
  # Fallback to any recent log
  if (-not $scoutLogs) {
    $scoutLogs = Get-ChildItem -Path "$LogDir\*.log" -ErrorAction SilentlyContinue | 
                 Sort-Object LastWriteTime -Descending | 
                 Select-Object -First 1
  }
  
  if ($scoutLogs) {
    try {
      # Start PowerShell window with Get-Content -Wait (WindowStyle Normal for manual positioning)
      # Note: WindowTitle must be set via command, not -Title argument
      $logPath = $scoutLogs.FullName
      $command = "`$Host.UI.RawUI.WindowTitle='MBRN Live Log Monitor'; Get-Content -Path '$logPath' -Wait"
      Start-Process powershell.exe -ArgumentList @(
        "-NoExit",
        "-WindowStyle", "Normal",
        "-Command", $command
      )
      Write-DayZeroLog "OK" "Live Log Monitor started: $($scoutLogs.Name)"
      Write-DayZeroLog "INFO" "Tip: Position this window at the right screen edge for Matrix-Style monitoring"
    } catch {
      Write-DayZeroLog "WARN" "Failed to start Log Monitor: $($_.Exception.Message)"
    }
  } else {
    Write-DayZeroLog "WARN" "No log files found in $LogDir for monitoring"
  }
}

function Show-MissionControlBanner {
  # ASCII Art Banner "MBRN ONLINE"
  $banner = @"

╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ███╗   ███╗██████╗ ██████╗ ███╗   ██╗    ██████╗ ███╗   ██╗██╗     ██╗   ║
║   ████╗ ████║██╔══██╗██╔══██╗████╗  ██║    ██╔═══╝ ████╗  ██║██║     ██║   ║
║   ██╔████╔██║██████╔╝██████╔╝██╔██╗ ██║    ██║     ██╔██╗ ██║██║     ██║   ║
║   ██║╚██╔╝██║██╔══██╗██╔══██╗██║╚██╗██║    ██║     ██║╚██╗██║██║     ██║   ║
║   ██║ ╚═╝ ██║██████╔╝██║  ██║██║ ╚████║    ╚██████╗██║ ╚████║███████╗██║   ║
║   ╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝     ╚═════╝╚═╝  ╚═══╝╚══════╝╚═╝   ║
║                                                                              ║
║                    🚀 MISSION CONTROL HUB (Level 3) ONLINE 🚀                ║
║                                                                              ║
║   Browser Tabs: Dashboard | Supabase | GitHub                                ║
║   Live Monitor: Log window ready for positioning                           ║
║   Status: All systems nominal - MBRN is GO for operations                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

"@
  Write-Host $banner -ForegroundColor Cyan
  Write-DayZeroLog "OK" "MBRN ONLINE - Mission Control Hub activated"
}

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

try {
  if (-not (Test-Path -LiteralPath $PipelineDir)) {
    throw "Pipeline directory not found: $PipelineDir"
  }

  Set-Location -LiteralPath $PipelineDir
  Write-DayZeroLog "INFO" "MBRN Day Zero Autopilot started pipeline_dir=$PipelineDir"

  if (-not (Test-Path -LiteralPath $EnvPath)) {
    Write-DayZeroLog "ERROR" "Missing .env file at $EnvPath"
    exit 1
  }

  $PythonExe = Resolve-PythonExecutable
  if (-not $PythonExe) {
    Write-DayZeroLog "ERROR" "Python executable not found. Expected venv\Scripts\python.exe or global python."
    exit 1
  }
  Write-DayZeroLog "INFO" "Python executable resolved python=$PythonExe"

  $llmLimitRaw = Get-DotEnvValue -Path $EnvPath -Key "DAY_ZERO_LLM_LIMIT"
  $llmLimit = $DefaultLlmLimit
  if ($llmLimitRaw) {
    $parsedLimit = 0
    if ([int]::TryParse($llmLimitRaw, [ref]$parsedLimit) -and $parsedLimit -gt 0) {
      $llmLimit = $parsedLimit
    } else {
      Write-DayZeroLog "WARN" "Invalid DAY_ZERO_LLM_LIMIT='$llmLimitRaw'; using default=$DefaultLlmLimit"
    }
  }
  Write-DayZeroLog "INFO" "LLM worker limit resolved limit=$llmLimit"

  # Wait for Ollama to be ready before starting LLM-dependent pipelines
  Wait-OllamaReady -TimeoutSeconds 30

  # Phase 1: Collect raw market news
  $collectorExit = Invoke-PipelineStep -Name "raw_market_news_collector" -Arguments @("raw_market_news_collector.py")
  if ($collectorExit -ne 0 -and $collectorExit -ne 2) {
    Write-DayZeroLog "ERROR" "Collector failed hard; subsequent steps skipped collector_exit=$collectorExit final_exit=1"
    exit 1
  }

  if ($collectorExit -eq 2) {
    Write-DayZeroLog "WARN" "Collector completed with partial failure; continuing to sentiment fetcher."
  }

  # Phase 2: Market sentiment analysis (NEW - Phase 3 Bridge Integration)
  $sentimentExit = Invoke-PipelineStep -Name "market_sentiment_fetcher" -Arguments @("market_sentiment_fetcher.py")
  if ($sentimentExit -ne 0 -and $sentimentExit -ne 2) {
    Write-DayZeroLog "WARN" "Sentiment fetcher failed; continuing to LLM worker sentiment_exit=$sentimentExit"
    # Non-fatal: continue with LLM worker even if sentiment fails
  }

  if ($sentimentExit -eq 2) {
    Write-DayZeroLog "WARN" "Sentiment fetcher completed with partial failure; continuing to LLM worker."
  }

  # Phase 3: LLM enrichment worker
  $llmExit = Invoke-PipelineStep -Name "local_llm_enrichment_worker" -Arguments @("local_llm_enrichment_worker.py", "--limit", "$llmLimit")

  # Optional Phase 4: Start Horizon Scout in background (if enabled)
  $scoutProcess = $null
  if ($EnableScout) {
    $scoutProcess = Start-HorizonScout -PythonExecutable $PythonExe -PipelineDirectory $PipelineDir
  } else {
    Write-DayZeroLog "INFO" "Horizon Scout disabled (use -EnableScout to activate)"
  }

  # Calculate final exit status
  $anyPartialFailure = ($collectorExit -eq 2) -or ($sentimentExit -eq 2) -or ($llmExit -eq 2)
  $anyHardFailure = ($collectorExit -ne 0 -and $collectorExit -ne 2) -or
                    ($sentimentExit -ne 0 -and $sentimentExit -ne 2) -or
                    ($llmExit -ne 0 -and $llmExit -ne 2)

  $scoutStatus = if ($scoutProcess) { "scout_running_pid=$($scoutProcess.Id)" } else { "scout_disabled" }

  # Phase 5: MISSION CONTROL HUB (Level 3) - Launch browser & log monitoring
  # Only activate on successful completion (no hard failures)
  if (-not $anyHardFailure) {
    Write-DayZeroLog "INFO" "Activating Mission Control Hub (Level 3)..."
    
    # Launch browser tabs (Dashboard, Supabase, GitHub)
    Launch-MissionControl -RepoRoot $RepoRoot -LogDir $LogDir
    
    # Start live log monitor window
    Start-LiveLogMonitor -LogDir $LogDir
    
    # Show MBRN ONLINE banner (ASCII Art)
    Show-MissionControlBanner
  }

  if (-not $anyHardFailure -and -not $anyPartialFailure) {
    Write-DayZeroLog "OK" "Day Zero Autopilot completed successfully (all 3 phases + Mission Control, $scoutStatus) final_exit=0"
    exit 0
  }

  if (-not $anyHardFailure -and $anyPartialFailure) {
    Write-DayZeroLog "WARN" "Day Zero Autopilot completed with partial failure(s) collector=$collectorExit sentiment=$sentimentExit llm=$llmExit $scoutStatus final_exit=2"
    exit 2
  }

  Write-DayZeroLog "ERROR" "Day Zero Autopilot failed hard collector=$collectorExit sentiment=$sentimentExit llm=$llmExit $scoutStatus final_exit=1"
  exit 1
} catch {
  Write-DayZeroLog "ERROR" "Unhandled Day Zero Autopilot error: $($_.Exception.Message)"
  exit 1
}
