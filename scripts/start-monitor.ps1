$LAB_ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $LAB_ROOT

Write-Host "=== Start WGS monitoring stack ==="
docker compose -f docker-compose.monitor.yml up -d prometheus grafana

Write-Host ""
Write-Host "=== Container status ==="
docker ps --filter "name=wgs-"

Write-Host ""
Write-Host "Grafana:    http://localhost:3001"
Write-Host "Prometheus: http://localhost:9090"
Write-Host ""
Write-Host "Grafana login uses GRAFANA_ADMIN_USER and GRAFANA_ADMIN_PASSWORD from .env."
