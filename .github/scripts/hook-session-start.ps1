# hook-session-start.ps1
# Evenement : SessionStart
# Injecte le contenu de .product/spiral-state.md comme contexte systeme
# pour que l'agent sache ou il en est des le premier prompt.

param()
$inputJson = [Console]::In.ReadToEnd()

$repoRoot   = Resolve-Path (Join-Path $PSScriptRoot '../..')
$spiralPath = Join-Path $repoRoot '.product/spiral-state.md'

$context = '(spiral-state.md introuvable)'
if (Test-Path $spiralPath) {
    $context = (Get-Content $spiralPath -Raw -Encoding UTF8).Trim()
}

$out = [ordered]@{
    hookSpecificOutput = [ordered]@{
        hookEventName     = 'SessionStart'
        additionalContext = "=== ETAT SPIRAL (spiral-state.md) ===`n$context`n=== FIN ETAT SPIRAL ==="
    }
}
$out | ConvertTo-Json -Depth 5 -Compress
