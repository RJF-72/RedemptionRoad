param(
  [Parameter(Mandatory=$true)][string]$UrlListPath,
  [string]$OutDir = (Join-Path $PSScriptRoot '..'),
  [switch]$AppendManifest
)

$ErrorActionPreference = 'Stop'

if (!(Test-Path $UrlListPath)) { throw "URL list not found: $UrlListPath" }
if (!(Test-Path $OutDir)) { New-Item -ItemType Directory -Force -Path $OutDir | Out-Null }

$urls = Get-Content -Path $UrlListPath | Where-Object { $_ -and -not $_.StartsWith('#') }
if ($urls.Count -eq 0) { Write-Host 'No URLs found.'; exit 0 }

$downloaded = @()
foreach ($u in $urls) {
  try {
    $fileName = [System.IO.Path]::GetFileName(($u -split '\?')[0])
    if (-not $fileName) { $fileName = "photo_$([DateTime]::Now.ToString('yyyyMMdd_HHmmss_fff')).jpg" }
    $dest = Join-Path $OutDir $fileName
    Invoke-WebRequest -Uri $u -OutFile $dest -UseBasicParsing
    $downloaded += $fileName
    Write-Host "Downloaded: $fileName"
  } catch {
    Write-Warning "Failed: $u -> $_"
  }
}

# Update manifest brand-images.json at project root
$manifest = Join-Path $OutDir 'brand-images.json'
if (Test-Path $manifest) {
  $existing = Get-Content $manifest | ConvertFrom-Json
  if ($AppendManifest) {
    $merged = @($existing + $downloaded) | Select-Object -Unique
  } else {
    $merged = @($existing + $downloaded)
  }
  $json = $merged | ConvertTo-Json -Compress
  Set-Content -Path $manifest -Value $json -Encoding UTF8
  Write-Host "Updated manifest: brand-images.json"
} else {
  $json = ($downloaded | ConvertTo-Json -Compress)
  Set-Content -Path $manifest -Value $json -Encoding UTF8
  Write-Host "Created manifest: brand-images.json"
}
