<#
.SYNOPSIS
Deployt die market_sentiment Edge Function und setzt die sicheren Secrets.
#>

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " MBRN - SUPABASE EDGE FUNCTION DEPLOYER (PILLAR 3)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$apiKey = Read-Host "Bitte gib einen sicheren API Key fuer DATA_ARB_API_KEY ein (Enter fuer Development-Key)"
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    $apiKey = "mbrn_dev_admin_key_999"
    Write-Host "Setze automatischen Dev-Key: $apiKey" -ForegroundColor Yellow
}

Write-Host "`n[1/2] Deployment der Edge Funktion 'market_sentiment'..." -ForegroundColor Green
try {
    supabase functions deploy market_sentiment
} catch {
    Write-Host "FEHLER: Supabase CLI nicht gefunden oder nicht eingeloggt." -ForegroundColor Red
    Write-Host "Bitte installiere die Supabase CLI via: npm i -g supabase" -ForegroundColor Yellow
    exit
}

Write-Host "`n[2/2] Registriere den API Key (DATA_ARB_API_KEY) sicher im Supabase Vault..." -ForegroundColor Green
supabase secrets set DATA_ARB_API_KEY=$apiKey

Write-Host "`n[SUCCESS] Deployment abgeschlossen! Der Heartbeat Endpoint ist nun live und geschuetzt." -ForegroundColor Green
Write-Host "Achtung: Stelle sicher, dass in deiner MBRN-HUB-V1/scripts/pipelines/.env der selbe Key steht!" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
