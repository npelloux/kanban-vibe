# hook-stop.ps1
# Evenement : Stop
# 1. Sauvegarde le prompt utilisateur dans un fichier session yyyy-mm-dd-hh-mm-{nom}.md
# 2. Gate tracabilite : avertit si spiral-state.md n'a pas ete modifie pendant la session
# Note : stop_hook_active est verifie pour eviter les boucles infinies.

param()
$inputJson = [Console]::In.ReadToEnd()

try {
    $input = $inputJson | ConvertFrom-Json -ErrorAction Stop
} catch {
    exit 0
}

# Securite anti-boucle : ne pas bloquer si on est deja dans un hook Stop
if ($input.stop_hook_active -eq $true) {
    exit 0
}

$repoRoot  = Resolve-Path (Join-Path $PSScriptRoot '../..')
$eventsDir = Join-Path $repoRoot '.product/.events'
if (-not (Test-Path $eventsDir)) { New-Item -ItemType Directory -Force $eventsDir | Out-Null }

$today = (Get-Date).ToString('yyyy-MM-dd')
$hhmm  = (Get-Date).ToString('HH-mm')

# --- 1. CREATION DU FICHIER SESSION ---
# Cherche si un fichier session existe deja aujourd'hui
$existing = Get-ChildItem $eventsDir -Filter "$today-*.md" -File |
            Where-Object { $_.Name -notmatch '^\.tools' } |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1

if (-not $existing) {
    # Determiner un nom de session depuis le sessionId ou timestamp
    $sessionId = if ($input.sessionId) { $input.sessionId -replace '[^a-zA-Z0-9-]', '' } else { 'session' }
    # Limiter la longueur du nom
    if ($sessionId.Length -gt 20) { $sessionId = $sessionId.Substring(0, 20) }
    $fileName    = "$today-$hhmm-$sessionId.md"
    $sessionPath = Join-Path $eventsDir $fileName

    $header = @"
# Session $today $hhmm
*SessionId : $($input.sessionId)*
*Cree par hook Stop — aucun fichier session existant pour aujourd'hui*

## Prompt utilisateur (dernier)

*(Contenu du prompt non disponible via l'evenement Stop — voir historique chat)*

## Decisions et artefacts

*(A completer manuellement ou via PreCompact)*
"@
    $header | Set-Content -Encoding UTF8 $sessionPath
    Write-Host "[hook-stop] Fichier session cree : $fileName"
}

# --- 2. GATE TRACABILITE : verifier que spiral-state.md a ete modifie aujourd'hui ---
$spiralPath = Join-Path $repoRoot '.product/spiral-state.md'
$warnMsg    = $null

if (Test-Path $spiralPath) {
    $lastWrite = (Get-Item $spiralPath).LastWriteTime.Date
    $todayDate = (Get-Date).Date
    if ($lastWrite -lt $todayDate) {
        $warnMsg = "TRACABILITE : spiral-state.md n'a pas ete mis a jour aujourd'hui. Pensez a mettre a jour l'etat de la spirale avant de clore la session."
    }
} else {
    $warnMsg = "TRACABILITE : spiral-state.md introuvable. Creez ce fichier pour maintenir l'etat de la spirale."
}

if ($warnMsg) {
    $out = [ordered]@{
        systemMessage = $warnMsg
    }
    $out | ConvertTo-Json -Depth 3 -Compress
}

exit 0
