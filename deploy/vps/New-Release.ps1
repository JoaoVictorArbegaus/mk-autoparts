[CmdletBinding()]
param(
    [string]$SiteUrl = 'https://mkautoparts.jksoftware.com.br',
    [string]$ReleaseId,
    [switch]$AllowDirty
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$frontendRoot = Join-Path $repoRoot 'frontend'
$outputRoot = Join-Path $PSScriptRoot 'out'

if (-not $ReleaseId) {
    $ReleaseId = (& git -C $repoRoot rev-parse --short=12 HEAD).Trim()
    if ($LASTEXITCODE -ne 0 -or -not $ReleaseId) {
        throw 'Não foi possível identificar o commit da release.'
    }
}

if ($ReleaseId -notmatch '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$') {
    throw 'ReleaseId inválido. Use somente letras, números, ponto, hífen e sublinhado.'
}

$dirty = & git -C $repoRoot status --porcelain
if ($LASTEXITCODE -ne 0) {
    throw 'Não foi possível conferir o estado do Git.'
}
if ($dirty -and -not $AllowDirty) {
    throw 'A árvore Git possui alterações. Commit a release ou use -AllowDirty conscientemente.'
}

$previousSiteUrl = $env:VITE_SITE_URL
try {
    $env:VITE_SITE_URL = $SiteUrl
    Push-Location $frontendRoot
    try {
        & npm.cmd ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'npm ci falhou.' }

        & npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw 'npm run build falhou.' }
    }
    finally {
        Pop-Location
    }
}
finally {
    $env:VITE_SITE_URL = $previousSiteUrl
}

$requiredFiles = @(
    'index.html',
    'catalogo\index.html',
    'painel\index.html',
    'admin\index.html',
    '404.html'
)
foreach ($relativePath in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $frontendRoot "dist\$relativePath"))) {
        throw "Build incompleto: falta dist\$relativePath."
    }
}

New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null
$archiveName = "mk-autoparts-$ReleaseId.tar.gz"
$archivePath = Join-Path $outputRoot $archiveName
$checksumPath = "$archivePath.sha256"

if (Test-Path -LiteralPath $archivePath) {
    Remove-Item -LiteralPath $archivePath -Force
}
if (Test-Path -LiteralPath $checksumPath) {
    Remove-Item -LiteralPath $checksumPath -Force
}

& tar.exe -C (Join-Path $frontendRoot 'dist') -czf $archivePath .
if ($LASTEXITCODE -ne 0) {
    throw 'Não foi possível gerar o pacote da release.'
}

$hash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
[System.IO.File]::WriteAllText($checksumPath, "$hash  $archiveName`n")

[pscustomobject]@{
    ReleaseId = $ReleaseId
    SiteUrl = $SiteUrl
    Archive = $archivePath
    Checksum = $checksumPath
    Sha256 = $hash
}
