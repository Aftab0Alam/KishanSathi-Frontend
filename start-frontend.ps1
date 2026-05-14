<#
.SYNOPSIS
  Start the KisanSathi frontend locally.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Push-Location $PSScriptRoot
try {
    Write-Host 'Starting Next.js frontend on http://localhost:3000...'
    npm run dev
}
finally {
    Pop-Location
}
