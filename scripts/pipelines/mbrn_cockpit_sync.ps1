# ================================================================================
# MBRN Cockpit Sync - Truth Layer Generator
# ================================================================================
# Scans integration_queue and generates diamonds.json for the Visual Cockpit.

$queueRoot = "docs\S3_Data\outputs\integration_queue"
$outputFile = "dashboard\diamonds.json"

function Sync-Diamonds {
    $diamonds = @()
    
    $apps = Get-ChildItem -Path $queueRoot -Directory
    foreach ($app in $apps) {
        $files = Get-ChildItem -Path $app.FullName -Filter "*.json" # Look for Value Cards
        foreach ($file in $files) {
            try {
                $card = Get-Content $file.FullName | ConvertFrom-Json
                $pyFile = $file.FullName.Replace(".json", ".py")
                
                if (Test-Path $pyFile) {
                    $raw = $card.raw_data
                    
                    # Robust field extraction (handle nulls/missing fields)
                    $nameStr = $raw.name; if ($null -eq $nameStr) { $nameStr = $card.module_name }
                    $appStr = $raw.app; if ($null -eq $appStr) { $appStr = $card.target_app }
                    $scoreVal = $raw.combined_score; if ($null -eq $scoreVal) { $scoreVal = $card.scoring.overall_value }
                    $money_score = $raw.money_score; if ($null -eq $money_score) { $money_score = $card.money_score }
                    if ($null -eq $money_score) { $money_score = 0 }
                    $roi_score = $raw.roi_score; if ($null -eq $roi_score) { $roi_score = 0 }
                    $riskVal = $raw.risk; if ($null -eq $riskVal) { $riskVal = "medium" }
                    $suggested_use = $raw.suggested_use; if ($null -eq $suggested_use) { $suggested_use = $card.suggested_use }
                    $reasonVal = $raw.reason; if ($null -eq $reasonVal) { $reasonVal = "High utility." }
                    $source_type = $raw.source_type; if ($null -eq $source_type) { $source_type = "unknown" }
                    $manufactured_at = $raw.manufactured_at; if ($null -eq $manufactured_at) { $manufactured_at = $card.manufactured_at }
                    $is_test = $raw.is_test
                    if ($null -eq $is_test) { $is_test = $false }
                    $is_test = ($is_test -eq $true -or $is_test -eq "True" -or $is_test -eq "true")

                    # Task 5/6: Filter test seeds unless MBRN_SHOW_TEST_DIAMONDS=1
                    $showTest = $env:MBRN_SHOW_TEST_DIAMONDS -eq "1"
                    if ($is_test -and -not $showTest) {
                        continue
                    }

                    # Qualitative Data v5.7
                    $category_tags = $raw.category_tags
                    if ($category_tags -is [string] -and $category_tags.StartsWith("[")) {
                        try { $category_tags = $category_tags | ConvertFrom-Json } catch { }
                    }
                    if ($null -eq $category_tags) { $category_tags = @() }

                    $diamond = [PSCustomObject]@{
                        name = $nameStr
                        app = $appStr
                        score = $scoreVal
                        money_score = $money_score
                        roi_score = $roi_score
                        risk = $riskVal
                        suggested_use = $suggested_use
                        reason = $reasonVal
                        category_tags = @($category_tags)
                        why_mvp = "$($raw.why_mvp)"
                        why_trash = "$($raw.why_trash)"
                        file_path = "docs/S3_Data/outputs/integration_queue/$appStr/$nameStr"
                        manufactured_at = "$manufactured_at"
                        source_type = $source_type
                        is_test = $is_test
                    }
                    $diamonds += $diamond
                } else {
                    Write-Host "[WARN] Missing .py file for $($file.FullName)"
                }
            } catch {
                Write-Host "Error parsing $($file.Name): $($_.Exception.Message)"
            }
        }
    }
    
    # Task 6: Multi-level sorting (Money > Score > Date)
    $sorted = $diamonds | Sort-Object @{Expression="money_score"; Descending=$true}, @{Expression="score"; Descending=$true}, @{Expression="manufactured_at"; Descending=$true}
    
    $json = $sorted | ConvertTo-Json
    if ($diamonds.Count -eq 1) { $json = "[$json]" }
    $json | Set-Content $outputFile -Encoding utf8
    Write-Host "[COCKPIT-SYNC] Generated diamonds.json with $($diamonds.Count) items."

    # MBRN OVERNIGHT UPGRADE: Diamond Ranker + Auto-Tagging
    if ($diamonds.Count -gt 0) {
        Write-Host "[COCKPIT-SYNC] Invoking Diamond Ranker..."
        python scripts/pipelines/mbrn_diamond_ranker.py
    }
}

# Run once
Sync-Diamonds
