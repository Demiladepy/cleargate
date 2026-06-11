# Downloads prebuilt Ethereum app ELF from LedgerHQ/app-ethereum releases
$ErrorActionPreference = "Stop"
$version = "1.22.1"
$url = "https://github.com/LedgerHQ/app-ethereum/releases/download/$version/app-$version-nanox.elf"
$outDir = Join-Path $PSScriptRoot "..\apps"
$outFile = Join-Path $outDir "ethereum.elf"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

if (Test-Path $outFile) {
  Write-Host "Already exists: $outFile ($((Get-Item $outFile).Length) bytes)"
  exit 0
}

Write-Host "Downloading $url ..."
Invoke-WebRequest -Uri $url -OutFile $outFile
Write-Host "Saved: $outFile ($((Get-Item $outFile).Length) bytes)"
