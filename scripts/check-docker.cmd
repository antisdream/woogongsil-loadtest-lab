@echo off
cd /d "%~dp0.."

echo === Docker version ===
docker --version

echo.
echo === Docker Compose version ===
docker compose version

echo.
echo === WGS containers ===
docker ps --filter "name=wgs-"
