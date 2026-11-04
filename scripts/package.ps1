$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $projectRoot 'dist'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$outputPath = Join-Path $outputDirectory 'desafio-vendedores.zip'
$outputStream = [IO.File]::Open($outputPath, [IO.FileMode]::Create)
$archive = [IO.Compression.ZipArchive]::new($outputStream, [IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($directory in @('layout', 'sections', 'templates', 'config', 'locales')) {
        Get-ChildItem -LiteralPath (Join-Path $projectRoot $directory) -File -Recurse | ForEach-Object {
            $entryPath = $_.FullName.Substring($projectRoot.Length + 1).Replace('\', '/')
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $entryPath) | Out-Null
        }
    }
} finally {
    $archive.Dispose()
    $outputStream.Dispose()
}
Write-Output $outputPath
