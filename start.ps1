# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Green
$backend = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory ".\backend" -PassThru -NoNewWindow

# Start frontend dev server
Write-Host "Starting frontend dev server..." -ForegroundColor Green
$frontend = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow

Write-Host ""
Write-Host "Backend running on PID: $($backend.Id)" -ForegroundColor Cyan
Write-Host "Frontend running on PID: $($frontend.Id)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow

# Cleanup function
$cleanup = {
    Write-Host "`nStopping servers..." -ForegroundColor Red
    Stop-Process -Id $backend.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $frontend.Id -ErrorAction SilentlyContinue
    exit
}

# Register Ctrl+C handler
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $cleanup | Out-Null

try {
    # Wait for both processes
    Wait-Process -Id $backend.Id, $frontend.Id
} catch {
    & $cleanup
}
