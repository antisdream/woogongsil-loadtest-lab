$LAB_ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $LAB_ROOT

Write-Host "=== Stop WGS monitoring stack ==="
docker compose -f docker-compose.monitor.yml down

Write-Host ""
Write-Host "=== Done ==="
