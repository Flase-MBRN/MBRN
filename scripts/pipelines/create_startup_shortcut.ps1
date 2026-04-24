param(
  [string]$RepoRoot = "C:\DevLab\MBRN-HUB-V1",
  [string]$StartupDir = "C:\Users\Erik\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup",
  [string]$ShortcutName = "MBRN_Autopilot.lnk"
)

$ErrorActionPreference = "Stop"

$PipelineDir = Join-Path $RepoRoot "scripts\pipelines"
$AutopilotScript = Join-Path $PipelineDir "day_zero_autopilot.ps1"
$ShortcutPath = Join-Path $StartupDir $ShortcutName

if (-not (Test-Path -LiteralPath $AutopilotScript)) {
  throw "Autopilot script not found: $AutopilotScript"
}

New-Item -ItemType Directory -Force -Path $StartupDir | Out-Null

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($ShortcutPath)
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Minimized -File `"$AutopilotScript`""
$shortcut.WorkingDirectory = $PipelineDir
$shortcut.Description = "Runs the MBRN Day Zero Autopilot once at Windows login."
$shortcut.IconLocation = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe,0"
$shortcut.WindowStyle = 7
$shortcut.Save()

Write-Host "Startup shortcut created or updated: $ShortcutPath"
Write-Host "Target: powershell.exe $($shortcut.Arguments)"
Write-Host "Working directory: $PipelineDir"
Write-Host "Run behavior: once per Windows login; logs remain in scripts\pipelines\logs."
