$ErrorActionPreference = 'Stop'

$pasta = Split-Path -Parent $MyInvocation.MyCommand.Path
$css = Get-Content -Raw -LiteralPath (Join-Path $pasta 'pdf.css')
$chrome = @(
    'C:\Program Files\Google\Chrome\Application\chrome.exe',
    'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

if (-not $chrome) {
    throw 'Chrome ou Edge não encontrado.'
}

$documentos = @(
    '01-apresentacao-proposta',
    '02-validacao-contratante'
)

$tempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$perfil = Join-Path $tempBase ("mk-autoparts-pdf-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $perfil | Out-Null

try {
    foreach ($nome in $documentos) {
        $markdown = Join-Path $pasta "$nome.md"
        $htmlTemporario = Join-Path $pasta ".$nome.html"
        $pdf = Join-Path $pasta "$nome.pdf"
        $perfilDocumento = Join-Path $perfil $nome
        New-Item -ItemType Directory -Path $perfilDocumento | Out-Null
        $corpo = (ConvertFrom-Markdown -InputObject (Get-Content -Raw -LiteralPath $markdown)).Html
        $html = @"
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>$css</style>
</head>
<body>$corpo</body>
</html>
"@
        Set-Content -LiteralPath $htmlTemporario -Value $html -Encoding utf8
        $uri = ([uri](Resolve-Path -LiteralPath $htmlTemporario).Path).AbsoluteUri
        if (Test-Path -LiteralPath $pdf) {
            Remove-Item -LiteralPath $pdf
        }
        & $chrome --headless --disable-gpu --no-pdf-header-footer "--user-data-dir=$perfilDocumento" "--print-to-pdf=$pdf" $uri | Out-Null
        for ($tentativa = 0; $tentativa -lt 100 -and -not (Test-Path -LiteralPath $pdf); $tentativa++) {
            Start-Sleep -Milliseconds 100
        }
        if (-not (Test-Path -LiteralPath $pdf) -or (Get-Item -LiteralPath $pdf).Length -eq 0) {
            throw "Falha ao gerar $pdf"
        }
        Remove-Item -LiteralPath $htmlTemporario
    }
}
finally {
    $perfilResolvido = [IO.Path]::GetFullPath($perfil)
    if ($perfilResolvido.StartsWith($tempBase, [StringComparison]::OrdinalIgnoreCase) -and
        (Split-Path -Leaf $perfilResolvido).StartsWith('mk-autoparts-pdf-')) {
        Remove-Item -LiteralPath $perfilResolvido -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Output 'PDFs gerados em docs/reuniao/.'
