param(
    [Parameter(Mandatory=$true)]
    [string]$Root,

    [switch]$Apply = $false,

    [switch]$ResolveShortcuts = $true,

    [string]$OutputCsv,

    [string]$SummaryPath,

    [switch]$Consolidate = $true,

    [ValidateSet('Recycle','Quarantine','Delete')]
    [string]$DeleteMode = 'Recycle',

    [string]$QuarantineDir,

    [int]$ActionLimit = 2000
    ,
    [switch]$PruneEmptyFolders = $false
)

# Ensure absolute path
$Root = [System.IO.Path]::GetFullPath($Root)
if (-not (Test-Path -LiteralPath $Root)) {
    Write-Error "Root path not found: $Root"
    exit 1
}

if (-not $OutputCsv) { $OutputCsv = Join-Path $Root 'mp3_inventory.csv' }
if (-not $SummaryPath) { $SummaryPath = Join-Path $Root 'organize_summary.txt' }
if (-not $QuarantineDir) { $QuarantineDir = Join-Path $Root '_Quarantine' }

$summary = New-Object System.Collections.Generic.List[string]
$inventory = New-Object System.Collections.Generic.List[psobject]
$consolidatedRoot = Join-Path $Root 'Consolidated'

function Test-InConsolidated {
    param([string]$Path)
    try {
        if (-not $Path) { return $false }
        $p = [string]$Path
        $cr = [string]$consolidatedRoot
        return $p.ToLower().StartsWith(($cr.ToLower() + [System.IO.Path]::DirectorySeparatorChar))
    } catch { return $false }
}

function Remove-Safe {
    param([string]$Path)
    try {
        if (-not (Test-Path -LiteralPath $Path)) { return $true }
        switch ($DeleteMode) {
            'Recycle' {
                try {
                    Add-Type -AssemblyName Microsoft.VisualBasic -ErrorAction SilentlyContinue | Out-Null
                    $ui = [Microsoft.VisualBasic.FileIO.UIOption]::OnlyErrorDialogs
                    $re = [Microsoft.VisualBasic.FileIO.RecycleOption]::SendToRecycleBin
                    [Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($Path, $ui, $re)
                    return $true
                } catch {
                    # Fallback to Quarantine if recycle fails
                    $dest = Join-Path $QuarantineDir (Split-Path -Path $Path -Leaf)
                    if (-not (Test-Path -LiteralPath $QuarantineDir)) { New-Item -ItemType Directory -Path $QuarantineDir -Force | Out-Null }
                    Move-Item -LiteralPath $Path -Destination $dest -Force
                    return $true
                }
            }
            'Quarantine' {
                if (-not (Test-Path -LiteralPath $QuarantineDir)) { New-Item -ItemType Directory -Path $QuarantineDir -Force | Out-Null }
                $dest = Join-Path $QuarantineDir (Split-Path -Path $Path -Leaf)
                Move-Item -LiteralPath $Path -Destination $dest -Force
                return $true
            }
            'Delete' {
                Remove-Item -LiteralPath $Path -Force
                return $true
            }
        }
    } catch {
        Write-Warning "Safe delete failed: $Path : $($_.Exception.Message)"
        return $false
    }
}

function Resolve-ShortcutTarget {
    param([string]$LnkPath)
    try {
        $ws = New-Object -ComObject WScript.Shell
        $sc = $ws.CreateShortcut($LnkPath)
        $target = $sc.TargetPath
        $args = $sc.Arguments
        $wd = $sc.WorkingDirectory
        return [pscustomobject]@{
            TargetPath = $target
            Arguments = $args
            WorkingDirectory = $wd
        }
    } catch {
        return $null
    }
}

function Compute-Hash {
    param(
        [string]$Path,
        [string]$Algorithm = 'SHA1'
    )
    try {
        if (-not (Test-Path -LiteralPath $Path)) { return $null }
        $h = Get-FileHash -LiteralPath $Path -Algorithm $Algorithm -ErrorAction Stop
        return $h.Hash
    } catch {
        return $null
    }
}

function Classify-Track {
    param(
        [string]$BaseName,
        [string]$FullPath
    )
    # Remove common suffixes from the filename base
    $name = $BaseName -replace '(?i)\s*-\s*shortcut$', ''

    $instrument = $null
    $isBand = $false

    # 1) Try from file name: take prefix before first comma
    $firstComma = $name.IndexOf(',')
    if ($firstComma -ge 0) {
        $instrument = $name.Substring(0, $firstComma).Trim()
    }

    # 2) Fall back to parent folder name
    if (-not $instrument -and $FullPath) {
        try {
            $parentDir = Split-Path -Path $FullPath -Parent
            $folder = Split-Path -Path $parentDir -Leaf
            if ($folder) {
                $fc = $folder.IndexOf(',')
                if ($fc -ge 0) {
                    $instrument = $folder.Substring(0, $fc).Trim()
                } else {
                    # If no comma, take first token up to first space or dash, typical pattern e.g. "Guitar_Riffs"
                    $instrument = ($folder -replace '[\-_]', ' ').Trim().Split(' ')[0]
                }
            }
        } catch {}
    }

    # Normalize some instrument names that include numeric prefixes like "Hi-Q 041 01 Drums"
    if ($instrument -match '(?i)\bdrums?\b') { $instrument = ($instrument -replace '(?i)^(hi-q\s*\d+\s*\d+\s*)', '').Trim() }
    if ($instrument -match '(?i)\bguitar\b') { $instrument = ($instrument -replace '(?i)^(hi-q\s*\d+\s*\d+\s*)', '').Trim() }
    if ($instrument -match '(?i)\bbass\b')   { $instrument = ($instrument -replace '(?i)^(hi-q\s*\d+\s*\d+\s*)', '').Trim() }
    if ($instrument -match '(?i)\bpiano\b')  { $instrument = ($instrument -replace '(?i)^(hi-q\s*\d+\s*\d+\s*)', '').Trim() }
    if ($instrument -match '(?i)\bsynth\b')  { $instrument = ($instrument -replace '(?i)^(hi-q\s*\d+\s*\d+\s*)', '').Trim() }

    # Band detection: look for ensemble/band/backing/no vocals/etc in filename or parent folder
    $parentTwoUp = ''
    if ($FullPath) {
        try { $parentTwoUp = Split-Path (Split-Path $FullPath -Parent) -Leaf } catch {}
    }
    $context = ($name + ' ' + $parentTwoUp)
    if ($context -match '(?i)\b(band|backing|minus|no\s*vocals|full\s*mix|karaoke|ensemble|orchestra|combo|trio|quartet|quintet|section)\b') {
        $isBand = $true
    }
    if ($instrument -and $instrument -match '(?i)^band$') { $isBand = $true }

    return [pscustomobject]@{
        Instrument = $instrument
        IsBand = [bool]$isBand
    }
}

function Proposed-Path {
    param(
        [string]$RootDir,
        [string]$Instrument,
        [bool]$IsBand,
        [string]$Leaf
    )
    if (-not $Consolidate) { return $null }
    if ($IsBand) {
        return Join-Path $RootDir (Join-Path 'Consolidated' (Join-Path 'Band (No Vocals)' $Leaf))
    }
    if ($Instrument) {
        return Join-Path $RootDir (Join-Path 'Consolidated' (Join-Path (Join-Path 'Instruments' $Instrument) $Leaf))
    }
    return Join-Path $RootDir (Join-Path 'Consolidated' (Join-Path 'Unclassified' $Leaf))
}

Write-Host "Scanning: $Root" -ForegroundColor Cyan

# Gather MP3 files
$mp3Files = Get-ChildItem -LiteralPath $Root -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -match '(?i)^\.mp3$' }
# Gather Shortcuts if requested
$lnkFiles = @()
if ($ResolveShortcuts) {
    $lnkFiles = Get-ChildItem -LiteralPath $Root -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -match '(?i)^\.lnk$' }
}

# Index direct MP3s
foreach ($f in $mp3Files) {
    $base = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
    $cls = Classify-Track -BaseName $base -FullPath $f.FullName
    $hash = Compute-Hash -Path $f.FullName
    $proposed = Proposed-Path -RootDir $Root -Instrument $cls.Instrument -IsBand $cls.IsBand -Leaf $f.Name

    $inventory.Add([pscustomobject]@{
        SourcePath = $f.FullName
        IsShortcut = $false
        ShortcutTarget = $null
        Exists = $true
        SizeBytes = $f.Length
        Hash = $hash
        Instrument = $cls.Instrument
        IsBand = $cls.IsBand
        ProposedPath = $proposed
        DuplicateGroupId = $null
        IsInConsolidated = (Test-InConsolidated -Path $f.FullName)
        ProposedAction = if ($Consolidate -and $proposed -and ($f.FullName -ne $proposed)) { 'Move' } else { 'Keep' }
    }) | Out-Null
}

# Index .lnk pointing to MP3s
foreach ($lnk in $lnkFiles) {
    $res = Resolve-ShortcutTarget -LnkPath $lnk.FullName
    if ($null -eq $res -or [string]::IsNullOrWhiteSpace($res.TargetPath)) { continue }

    # Attempt to resolve relative path from WorkingDirectory
    $targetPath = $res.TargetPath
    if (-not (Test-Path -LiteralPath $targetPath) -and $res.WorkingDirectory) {
        $candidate = Join-Path $res.WorkingDirectory $res.TargetPath
        if (Test-Path -LiteralPath $candidate) { $targetPath = $candidate }
    }

    $targetExists = Test-Path -LiteralPath $targetPath
    $isMp3Target = $targetExists -and ([System.IO.Path]::GetExtension($targetPath) -match '(?i)^\.mp3$')

    $hash = $null
    $size = $null
    $leaf = $lnk.Name
    $base = [System.IO.Path]::GetFileNameWithoutExtension($lnk.Name)
    $fullForClass = $lnk.FullName
    if ($isMp3Target) { $fullForClass = $targetPath }
    $cls = Classify-Track -BaseName $base -FullPath $fullForClass

    if ($isMp3Target) {
        try {
            $fi = Get-Item -LiteralPath $targetPath -ErrorAction Stop
            $size = $fi.Length
            $leaf = $fi.Name
            $hash = Compute-Hash -Path $fi.FullName
        } catch {}
    }

    $proposed = Proposed-Path -RootDir $Root -Instrument $cls.Instrument -IsBand $cls.IsBand -Leaf $leaf

    $inventory.Add([pscustomobject]@{
        SourcePath = $lnk.FullName
        IsShortcut = $true
        ShortcutTarget = $targetPath
        Exists = $targetExists
        SizeBytes = $size
        Hash = $hash
        Instrument = $cls.Instrument
        IsBand = $cls.IsBand
        ProposedPath = $proposed
        DuplicateGroupId = $null
        IsInConsolidated = (Test-InConsolidated -Path $targetPath)
        ProposedAction = if ($isMp3Target -and $Consolidate -and $proposed -and ($targetPath -ne $proposed)) { 'MoveTarget' } else { 'KeepShortcut' }
    }) | Out-Null
}

# Deduplicate by hash (for known hashes)
$byHash = $inventory | Where-Object { $_.Hash } | Group-Object -Property Hash
$duplicateGroups = @()
$groupCounter = 0
foreach ($grp in $byHash) {
    if ($grp.Count -gt 1) {
        $groupCounter++
        $duplicateGroups += $grp
        # Choose canonical item to keep: prefer direct MP3, then one already in Consolidated, then shortest path
        $keep = $grp.Group |
            Sort-Object @{Expression='IsShortcut';Descending=$false}, @{Expression='IsInConsolidated';Descending=$true}, @{Expression={ $_.SourcePath.Length };Descending=$false} |
            Select-Object -First 1
        foreach ($item in $grp.Group) {
            $item.DuplicateGroupId = $groupCounter
            if ($item -ne $keep) {
                if ($item.IsShortcut) { $item.ProposedAction = 'DeleteShortcut' }
                else { $item.ProposedAction = 'DeleteFile' }
            } else {
                # Ensure kept direct MP3 is consolidated if needed
                if ($Consolidate -and $item.ProposedAction -eq 'Keep' -and $item.ProposedPath -and ($item.SourcePath -ne $item.ProposedPath)) {
                    $item.ProposedAction = 'Move'
                }
            }
        }
    }
}

# Also flag duplicate shortcuts that point to the same target (even if hash unknown)
$shortcutGroups = $inventory | Where-Object { $_.IsShortcut -and $_.ShortcutTarget } | Group-Object -Property ShortcutTarget
foreach ($grp in $shortcutGroups) {
    if ($grp.Count -gt 1) {
        $groupCounter++
        $keep = $grp.Group | Sort-Object @{Expression={ $_.SourcePath.Length };Descending=$false} | Select-Object -First 1
        foreach ($item in $grp.Group) {
            if ($null -eq $item.DuplicateGroupId -or $item.DuplicateGroupId -eq 0) { $item.DuplicateGroupId = $groupCounter }
            if ($item -ne $keep) {
                $item.ProposedAction = 'DeleteShortcut'
            }
        }
    }
}

# Write CSV
$inventory | Sort-Object Instrument, IsBand, SourcePath | Export-Csv -LiteralPath $OutputCsv -NoTypeInformation -Encoding UTF8

# Build summary
$total = $inventory.Count
$mp3Count = ($inventory | Where-Object { -not $_.IsShortcut }).Count
$lnkCount = ($inventory | Where-Object { $_.IsShortcut }).Count
$dupeCount = ($inventory | Where-Object { $_.DuplicateGroupId }).Count
$deleteCount = ($inventory | Where-Object { $_.ProposedAction -in @('DeleteFile','DeleteShortcut') }).Count
$moveCount = ($inventory | Where-Object { $_.ProposedAction -in @('Move','MoveTarget') }).Count

$summary.Add("Root: $Root") | Out-Null
$summary.Add("Inventory CSV: $OutputCsv") | Out-Null
$summary.Add("Total items indexed: $total (MP3s: $mp3Count, Shortcuts: $lnkCount)") | Out-Null
$summary.Add("Duplicate items flagged: $dupeCount") | Out-Null
$summary.Add("Proposed deletions: $deleteCount") | Out-Null
$summary.Add("Proposed moves: $moveCount") | Out-Null
$summary.Add("") | Out-Null

$summary.Add("Top instruments:") | Out-Null
$topInst = $inventory | Group-Object -Property Instrument | Sort-Object Count -Descending | Select-Object -First 15
foreach ($t in $topInst) {
    $instName = if ([string]::IsNullOrWhiteSpace([string]$t.Name)) { '[Unclassified]' } else { [string]$t.Name }
    $summary.Add( (" - {0}: {1}" -f $instName, $t.Count) ) | Out-Null
}
$summary.Add("") | Out-Null

$summary.Add("Duplicate groups (first 20):") | Out-Null
$dupPreview = $inventory | Where-Object { $_.DuplicateGroupId } | Group-Object -Property DuplicateGroupId | Sort-Object Name | Select-Object -First 20
foreach ($g in $dupPreview) {
    $summary.Add(" Group #$($g.Name):") | Out-Null
    foreach ($i in $g.Group) {
        $summary.Add("   [$($i.ProposedAction)] $($i.SourcePath) -> Target: $($i.ShortcutTarget)") | Out-Null
    }
}
$summary.Add("") | Out-Null

$summary.Add("Planned actions (dry-run by default):") | Out-Null
$plan = $inventory | Where-Object { $_.ProposedAction -ne 'Keep' -and $_.ProposedAction }
foreach ($p in $plan | Select-Object -First 50) {
    switch ($p.ProposedAction) {
        'DeleteFile'     { $summary.Add(" - Delete file: $($p.SourcePath)") | Out-Null }
        'DeleteShortcut' { $summary.Add(" - Delete shortcut: $($p.SourcePath)") | Out-Null }
        'Move'           { $summary.Add(" - Move file: $($p.SourcePath) -> $($p.ProposedPath)") | Out-Null }
        'MoveTarget'     { $summary.Add(" - Move shortcut target: $($p.ShortcutTarget) -> $($p.ProposedPath)") | Out-Null }
    }
}
if ($plan.Count -gt 50) { $summary.Add(" ...and $($plan.Count - 50) more actions.") | Out-Null }

# If Apply, execute actions
if ($Apply) {
    Write-Host "APPLY mode: executing proposed actions" -ForegroundColor Yellow

    # Moves first (targets), then deletes
    $moves = $inventory | Where-Object { $_.ProposedAction -in @('Move','MoveTarget') }
    $performed = 0
    foreach ($m in $moves) {
        if ($ActionLimit -gt 0 -and $performed -ge $ActionLimit) { break }
        $src = if ($m.ProposedAction -eq 'Move') { $m.SourcePath } else { $m.ShortcutTarget }
        if (-not $src) { continue }
        if (-not (Test-Path -LiteralPath $src)) { continue }
        $dst = $m.ProposedPath
        if (-not $dst) { continue }
        $dstDir = Split-Path -Path $dst -Parent
        try { if (-not (Test-Path -LiteralPath $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null } } catch {}
        try {
            Move-Item -LiteralPath $src -Destination $dst -Force -ErrorAction Stop
            Write-Host "Moved: $src -> $dst" -ForegroundColor Green
            $performed++
        } catch {
            Write-Warning "Failed to move: $src -> $dst : $($_.Exception.Message)"
        }
    }

    $deletes = $inventory | Where-Object { $_.ProposedAction -in @('DeleteFile','DeleteShortcut') }
    foreach ($d in $deletes) {
        if ($ActionLimit -gt 0 -and $performed -ge $ActionLimit) { break }
        $target = $d.SourcePath
        try {
            if (Test-Path -LiteralPath $target) {
                if (Remove-Safe -Path $target) {
                    Write-Host ("Deleted ({0}): {1}" -f $DeleteMode, $target) -ForegroundColor Green
                    $performed++
                } else {
                    Write-Warning "Failed to delete (safe): $target"
                }
            }
        } catch {
            Write-Warning "Failed to delete: $target : $($_.Exception.Message)"
        }
    }

    Write-Host ("Apply completed. Actions performed: {0}/{1}" -f $performed, $ActionLimit) -ForegroundColor Yellow

    if ($PruneEmptyFolders) {
        Write-Host "Pruning empty folders..." -ForegroundColor Yellow
        try {
            # Remove directories that have no files (recursively)
            $dirs = Get-ChildItem -LiteralPath $Root -Recurse -Directory -ErrorAction SilentlyContinue | Sort-Object FullName -Descending
            foreach ($d in $dirs) {
                try {
                    $hasFiles = Get-ChildItem -LiteralPath $d.FullName -File -Force -ErrorAction SilentlyContinue | Select-Object -First 1
                    $hasDirs = Get-ChildItem -LiteralPath $d.FullName -Directory -Force -ErrorAction SilentlyContinue | Select-Object -First 1
                    if (-not $hasFiles -and -not $hasDirs) {
                        Remove-Item -LiteralPath $d.FullName -Force -ErrorAction SilentlyContinue
                        Write-Host "Removed empty folder: $($d.FullName)" -ForegroundColor DarkGray
                    }
                } catch {}
            }
        } catch {
            Write-Warning "Prune folders failed: $($_.Exception.Message)"
        }
    }
}

# Write summary
$summaryStr = ($summary -join [Environment]::NewLine)
$summaryStr | Out-File -LiteralPath $SummaryPath -Encoding UTF8

Write-Host "Done. See:`n - $OutputCsv`n - $SummaryPath" -ForegroundColor Cyan
