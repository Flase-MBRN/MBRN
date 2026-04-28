# ================================================================================
# MBRN Queue Audit - v5.6.1 Verification
# ================================================================================
# Verifies the state of the integration queue, decisions, and plans.

$queueRoot = "docs\S3_Data\outputs\integration_queue"
$decisionsFile = "docs\S3_Data\outputs\prime_decisions.json"
$plansDir = "docs\S3_Data\outputs\integration_plans"
$diamondsFile = "dashboard\diamonds.json"

Write-Host "--- [MBRN QUEUE AUDIT] ---" -ForegroundColor Cyan

# 1. Integration Queue Folders
Write-Host "[1] Checking Integration Queue Folders..."
$dimensions = @("automation", "chronos", "finance", "hub", "numerology")
$totalModules = 0
foreach ($dim in $dimensions) {
    $path = Join-Path $queueRoot $dim
    if (Test-Path $path) {
        $count = (Get-ChildItem -Path $path -Filter "*.py").Count
        $totalModules += $count
        Write-Host "  - ${dim}: OK ($count modules)" -ForegroundColor Green
    } else {
        Write-Host "  - ${dim}: MISSING" -ForegroundColor Red
    }
}
if ($totalModules -eq 0) {
    Write-Host "  ! WARNING: Horizon-Scout found 0 new candidates. Check logs or config." -ForegroundColor Yellow
}

# 2. Prime Decisions & Metrics
Write-Host "`n[2] Checking Prime Decisions & Metrics..."
if (Test-Path $decisionsFile) {
    $decisions = Get-Content $decisionsFile | ConvertFrom-Json
    $count = $decisions.Count
    
    $prepareCount = ($decisions | Where-Object { $_.decision -eq "prepare_integration" }).Count
    $reviewCount = ($decisions | Where-Object { $_.decision -eq "needs_review" }).Count
    $rejectCount = ($decisions | Where-Object { $_.decision -eq "reject" }).Count
    
    Write-Host "  - Total Decisions: $count" -ForegroundColor Green
    Write-Host "  - Prepare Integration: $prepareCount" -ForegroundColor Cyan
    Write-Host "  - Needs Review: $reviewCount" -ForegroundColor Yellow
    Write-Host "  - Rejected: $rejectCount" -ForegroundColor Red
    
    Write-Host "`n  [TOP 5 COMBINED SCORE]"
    $decisions | Sort-Object score -Descending | Select-Object -First 5 module, target_app, score, risk | Format-Table
    
    Write-Host "  [TOP 5 MONEY SCORE]"
    $decisions | Sort-Object money_score -Descending | Select-Object -First 5 module, target_app, money_score | Format-Table
} else {
    Write-Host "  - prime_decisions.json MISSING" -ForegroundColor Red
}

# 3. Integration Plans
Write-Host "`n[3] Checking Integration Plans..."
if (Test-Path $plansDir) {
    $plans = Get-ChildItem -Path $plansDir -Filter "*.md"
    Write-Host "  - OK ($($plans.Count) plans found)" -ForegroundColor Green
} else {
    Write-Host "  - integration_plans folder MISSING" -ForegroundColor Red
}

# 4. Diamonds Feed (v5.7 expanded)
Write-Host "`n[4] Checking Diamonds Feed (Cockpit Truth Layer)..."
if (Test-Path $diamondsFile) {
    $diamonds = Get-Content $diamondsFile | ConvertFrom-Json
    Write-Host "  - OK ($($diamonds.Count) items in feed)" -ForegroundColor Green
    if ($diamonds.Count -gt 0) {
        $diamonds | Select-Object -First 3 name, app, score, money_score, risk | Format-Table
    }
} else {
    Write-Host "  - diamonds.json MISSING" -ForegroundColor Red
}

Write-Host "`n--- [AUDIT COMPLETE] ---" -ForegroundColor Cyan
