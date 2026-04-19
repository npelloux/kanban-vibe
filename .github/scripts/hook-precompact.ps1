# hook-precompact.ps1
# Evenement : PreCompact
# Exporte le contexte de compaction dans le fichier session du jour.
# Cree le fichier s'il n'existe pas encore.
# Format : .product/.events/yyyy-mm-dd-hh-mm-{session}.md

param()
$inputJson = [Console]::In.ReadToEnd()

try {
    $input = $inputJson | ConvertFrom-Json -ErrorAction Stop
} catch {
    exit 0
}

$repoRoot   = Resolve-Path (Join-Path $PSScriptRoot '../..')
$eventsDir  = Join-Path $repoRoot '.product/.events'
if (-not (Test-Path $eventsDir)) { New-Item -ItemType Directory -Force $eventsDir | Out-Null }

# Cherche le fichier session du jour (pattern yyyy-mm-dd-*)
$today      = (Get-Date).ToString('yyyy-MM-dd')
$sessionFile = Get-ChildItem $eventsDir -Filter "$today-*.md" -File |
               Where-Object { $_.Name -notmatch '\.tools' } |
               Sort-Object LastWriteTime -Descending |
               Select-Object -First 1

# Si aucun fichier session n'existe aujourd'hui, en creer un
if (-not $sessionFile) {
    $hhmm        = (Get-Date).ToString('HH-mm')
    $sessionName = "session-autocompact"
    $fileName    = "$today-$hhmm-$sessionName.md"
    $sessionPath = Join-Path $eventsDir $fileName
    $header = @"
# Session $today - Auto-compaction
*Fichier cree automatiquement par hook PreCompact*

## Contexte pre-compaction

"@
    $header | Set-Content -Encoding UTF8 $sessionPath
    $sessionFile = Get-Item $sessionPath
}

# Ajouter le snapshot de compaction
$ts        = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
$sessionId = if ($input.sessionId) { $input.sessionId } else { 'inconnu' }
$trigger   = if ($input.trigger) { $input.trigger } else { 'auto' }

$block = @"

---
## Snapshot PreCompact — $ts
*SessionId : $sessionId | Trigger : $trigger*

### Etat spiral-state au moment de la compaction
"@

$spiralPath = Join-Path $repoRoot '.product/spiral-state.md'
if (Test-Path $spiralPath) {
    $spiralContent = (Get-Content $spiralPath -Raw -Encoding UTF8).Trim()
    $block += "`n`n``````markdown`n$spiralContent`n``````"
} else {
    $block += "`n*(spiral-state.md introuvable)*"
}

$block | Add-Content -Encoding UTF8 $sessionFile.FullName

exit 0
