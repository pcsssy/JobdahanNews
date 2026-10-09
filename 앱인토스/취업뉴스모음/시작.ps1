$ErrorActionPreference = 'Stop'
$appRoot = $PSScriptRoot
$localNode = Join-Path $appRoot '..\..\.tools\node-v22.16.0-win-x64\node.exe'
if (Test-Path -LiteralPath $localNode) { & $localNode (Join-Path $appRoot 'server\index.mjs') }
else { & node (Join-Path $appRoot 'server\index.mjs') }
