@echo off
cd /d "%~dp0.."

echo === Start WGS monitoring stack ===
docker compose -f docker-compose.monitor.yml up -d prometheus grafana

echo.
echo === Container status ===
docker ps --filter "name=wgs-"

echo.
echo Grafana:    http://localhost:3001
echo Prometheus: http://localhost:9090
echo Grafana login uses GRAFANA_ADMIN_USER and GRAFANA_ADMIN_PASSWORD from .env.
