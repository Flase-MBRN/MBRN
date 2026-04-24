param(
  [string]$RepoRoot = "C:\DevLab\MBRN-HUB-V1",
  [int]$DefaultLlmLimit = 10,
  [switch]$DryRun
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

  $collectorExit = Invoke-PipelineStep -Name "raw_market_news_collector" -Arguments @("raw_market_news_collector.py")
  if ($collectorExit -ne 0 -and $collectorExit -ne 2) {
    Write-DayZeroLog "ERROR" "Collector failed hard; LLM worker skipped collector_exit=$collectorExit final_exit=1"
    exit 1
  }

  if ($collectorExit -eq 2) {
    Write-DayZeroLog "WARN" "Collector completed with partial failure; continuing to LLM worker."
  }

  $llmExit = Invoke-PipelineStep -Name "local_llm_enrichment_worker" -Arguments @("local_llm_enrichment_worker.py", "--limit", "$llmLimit")

  if ($llmExit -eq 0 -and $collectorExit -eq 0) {
    Write-DayZeroLog "OK" "Day Zero Autopilot completed successfully final_exit=0"
    exit 0
  }

  if ($llmExit -eq 0 -and $collectorExit -eq 2) {
    Write-DayZeroLog "WARN" "Day Zero Autopilot completed with collector partial failure final_exit=2"
    exit 2
  }

  if ($llmExit -eq 2) {
    Write-DayZeroLog "WARN" "Day Zero Autopilot completed with LLM partial failure final_exit=2"
    exit 2
  }

  Write-DayZeroLog "ERROR" "LLM worker failed hard llm_exit=$llmExit final_exit=1"
  exit 1
} catch {
  Write-DayZeroLog "ERROR" "Unhandled Day Zero Autopilot error: $($_.Exception.Message)"
  exit 1
}
