# hook-pretooluse.ps1
# Evenement : PreToolUse
# 1. Log usage outil + intention dans .product/.events/.tools/yyyy-mm-dd.jsonl
# 2. Lint vocabulaire CODIR : bloque si terme meta-langage interdit dans un fichier HTML edite

param()
$inputJson = [Console]::In.ReadToEnd()

try {
    $input = $inputJson | ConvertFrom-Json -ErrorAction Stop
} catch {
    exit 0
}

$repoRoot  = Resolve-Path (Join-Path $PSScriptRoot '../..')
$toolsDir  = Join-Path $repoRoot '.product/.events/.tools'
if (-not (Test-Path $toolsDir)) { New-Item -ItemType Directory -Force $toolsDir | Out-Null }

# --- 1. LOG OUTIL ---
$date     = (Get-Date).ToString('yyyy-MM-dd')
$logFile  = Join-Path $toolsDir "$date.jsonl"
$logEntry = [ordered]@{
    ts        = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')
    tool      = $input.tool_name
    sessionId = $input.sessionId
    input     = $input.tool_input
}
$logEntry | ConvertTo-Json -Depth 4 -Compress | Add-Content -Encoding UTF8 $logFile

# --- 2. LINT VOCABULAIRE CODIR ---
# Detecte l usage de termes meta-langage internes dans les fichiers HTML CODIR
$forbiddenTerms = @('\bEHS\b', '\bLBC\b', '\binvariant\b', '\bKR[0-9]?\b', '\bEpic Hypothesis\b')

$filePath = $null
if ($input.tool_input.filePath)  { $filePath = $input.tool_input.filePath }
elseif ($input.tool_input.path)  { $filePath = $input.tool_input.path }

if ($filePath -and $filePath -match '\.html$') {
    $newContent = ''
    if ($input.tool_input.newString) { $newContent = $input.tool_input.newString }
    elseif ($input.tool_input.content) { $newContent = $input.tool_input.content }
    
    foreach ($term in $forbiddenTerms) {
        if ($newContent -match $term) {
            $out = [ordered]@{
                hookSpecificOutput = [ordered]@{
                    hookEventName          = 'PreToolUse'
                    permissionDecision     = 'deny'
                    permissionDecisionReason = "LINT CODIR : terme meta-langage interdit '$term' detecte dans le fichier HTML. Utiliser le vocabulaire CODIR (ex: 'Dossier COMEX' au lieu de 'EHS/LBC', 'resultat cle' au lieu de 'KR', 'critere' au lieu de 'invariant')."
                }
            }
            $out | ConvertTo-Json -Depth 5 -Compress
            exit 0
        }
    }
}

exit 0
