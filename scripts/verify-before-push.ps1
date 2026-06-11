# Run before first git push - fails if secrets or local-only files would be committed.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$fail = $false

if (-not (Test-Path .git)) {
    Write-Host "OK: not a git repo yet (init when ready)."
    exit 0
}

$tracked = git ls-files 2>$null
$blocked = @(
    ".env",
    ".env.local",
    "apps/ethereum.elf",
    "node_modules"
)

foreach ($pattern in $blocked) {
    $hits = $tracked | Where-Object { $_ -like "*$pattern*" -or $_ -eq $pattern }
    if ($hits) {
        Write-Host "BLOCKED: tracked file(s) that must not be pushed:"
        $hits | ForEach-Object { Write-Host "  $_" }
        $fail = $true
    }
}

$staged = git diff --cached --name-only 2>$null
if ($staged -match "^\.env$") {
    Write-Host "BLOCKED: .env is staged - run: git reset HEAD .env"
    $fail = $true
}

if ($fail) {
    Write-Host ""
    Write-Host "Fix the above before pushing."
    exit 1
}

Write-Host "OK: no blocked files tracked. Safe to push."
exit 0
