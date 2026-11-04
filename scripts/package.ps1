param([string]$ThemePath, [string]$OutputPath)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $projectRoot 'dist'
if (-not $ThemePath) { $ThemePath = Join-Path $outputDirectory 'horizon' }
$ThemePath = (Resolve-Path -LiteralPath $ThemePath).Path.TrimEnd([char[]]@('\', '/'))
if (-not (Test-Path -LiteralPath (Join-Path $ThemePath 'layout/theme.liquid'))) { throw 'Monte o Horizon antes de gerar o ZIP.' }
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (-not $OutputPath) { $OutputPath = Join-Path $outputDirectory 'desafio-vendedores.zip' }
$outputStream = [IO.File]::Open($outputPath, [IO.FileMode]::Create)
$archive = [IO.Compression.ZipArchive]::new($outputStream, [IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($directory in @('assets', 'blocks', 'layout', 'sections', 'snippets', 'templates', 'config', 'locales')) {
        Get-ChildItem -LiteralPath (Join-Path $ThemePath $directory) -File -Recurse | ForEach-Object {
            $entryPath = $_.FullName.Substring($ThemePath.Length + 1).Replace('\', '/')
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $entryPath) | Out-Null
        }
    }
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $ThemePath 'LICENSE.md'), 'LICENSE.md') | Out-Null
} finally {
    $archive.Dispose()
    $outputStream.Dispose()
}
Write-Output $outputPath
