# ================================================================================
# MBRN Nomenclature Migrator - v3 Alignment
# ================================================================================
# Migrates data from 'discipline' to 'chronos' (Dimension: zeit).

$targets = @(
    "dashboard\diamonds.json",
    "docs\S3_Data\outputs\prime_decisions.json"
)

# 1. Migrate root JSON files
foreach ($file in $targets) {
    if (Test-Path $file) {
        Write-Host "Migrating $file..."
        $content = Get-Content $file -Raw
        $newContent = $content -replace '"target_app": "discipline"', '"target_app": "chronos"'
        $newContent = $newContent -replace '"app": "discipline"', '"app": "chronos"'
        $newContent = $newContent -replace '/integration_queue/discipline/', '/integration_queue/chronos/'
        Set-Content $file $newContent -Encoding UTF8
    }
}

# 2. Migrate Value Cards in the queue
$queueDir = "docs\S3_Data\outputs\integration_queue"
if (Test-Path $queueDir) {
    $cards = Get-ChildItem -Path $queueDir -Filter "*.json" -Recurse
    foreach ($card in $cards) {
        Write-Host "Migrating Value Card: $($card.Name)"
        $content = Get-Content $card.FullName -Raw
        $newContent = $content -replace '"target_app": "discipline"', '"target_app": "chronos"'
        Set-Content $card.FullName $newContent -Encoding UTF8
    }
}

Write-Host "Nomenclature migration complete."
