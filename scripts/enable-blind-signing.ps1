# Presses Speculos buttons via REST API to enable blind signing in Ethereum app settings.
# Run while http://localhost:5000 is open and Ethereum app is on the main screen.
$base = "http://127.0.0.1:5000"

function Press-Button($name) {
  $body = '{"action":"press-and-release"}' 
  Invoke-RestMethod -Method Post -Uri "$base/button/$name" -Body $body -ContentType "application/json"
  Start-Sleep -Milliseconds 400
}

Write-Host "Enabling blind signing in Ethereum app settings..."
Write-Host "If this doesn't work, do it manually in the browser:"
Write-Host "  Settings -> Blind signing -> Enable -> Approve"
Write-Host ""

# Scroll down to Settings on Ethereum home (may need extra right presses on your build)
1..4 | ForEach-Object { Press-Button "right" }
Press-Button "both"   # open Settings
Start-Sleep -Milliseconds 600
1..3 | ForEach-Object { Press-Button "right" }
Press-Button "both"   # Blind signing
Press-Button "both"   # Enable / confirm
Press-Button "both"   # Approve warning

Write-Host "Done. Check localhost:5000 — blind signing should now be enabled."
