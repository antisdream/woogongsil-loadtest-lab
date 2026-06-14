Write-Host "=== Check WGS local backend ==="

try {
  $res = Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing -TimeoutSec 5
  Write-Host "Backend responded. Status:" $res.StatusCode
} catch {
  Write-Host "Backend check failed."
  Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "=== Check WGS local frontend ==="

try {
  $res = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
  Write-Host "Frontend responded. Status:" $res.StatusCode
} catch {
  Write-Host "Frontend check failed."
  Write-Host $_.Exception.Message
}
