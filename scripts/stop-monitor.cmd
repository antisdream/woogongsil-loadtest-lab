@echo off
cd /d "%~dp0.."

echo === Stop WGS monitoring stack ===
docker compose -f docker-compose.monitor.yml down

echo.
echo === Done ===
