# cleanup-orphan-worktrees.ps1
#
# Removes orphan worktree directories under .claude\worktrees\ that git
# no longer tracks but Windows kept locked (open file handles from VS Code /
# Node / Claude Code at the time of `git worktree remove`).
#
# Created 2026-05-20 after a worktree audit cleaned 9 worktrees -> 2 (canonical
# + heuristic-kepler-947fd0 active session). The 4 orphans below survived
# because Windows held file handles. After a reboot, those handles are gone
# and this script can sweep them.
#
# Usage:
#   1. Reboot Windows (releases any stuck file handles)
#   2. Open PowerShell in C:\consne
#   3. Run:    .\scripts\cleanup-orphan-worktrees.ps1
#   4. If a directory is STILL locked, the script reports which process
#      holds it. Close that process and re-run.
#
# Safe by design:
#   - Confirms each folder exists before touching it
#   - Skips C:\consne\.claude\worktrees\heuristic-kepler-947fd0 (active worktree)
#   - Refuses to run if a real git worktree is registered at the target path
#   - Lists what it would delete, prompts for confirmation, then acts

[CmdletBinding()]
param(
    [switch]$Force  # skip the confirmation prompt
)

$ErrorActionPreference = 'Stop'

$repoRoot = 'C:\consne'
$worktreeDir = Join-Path $repoRoot '.claude\worktrees'

# Known orphans (locked at cleanup time 2026-05-20)
$orphans = @(
    'condescending-brown-581e12',
    'dreamy-matsumoto-308587',
    'eloquent-robinson-9e687a',
    'priceless-jang-95030a'
)

# Active worktree we must NEVER touch
$active = 'heuristic-kepler-947fd0'

Write-Host ''
Write-Host '== Storey worktree cleanup =='  -ForegroundColor Cyan
Write-Host "Repo: $repoRoot"
Write-Host "Worktree dir: $worktreeDir"
Write-Host ''

# Safety net: confirm none of the orphans are active git worktrees
Push-Location $repoRoot
try {
    $registered = (& git worktree list --porcelain 2>$null) | Select-String '^worktree ' | ForEach-Object { ($_ -replace '^worktree ', '').Trim() }
} finally {
    Pop-Location
}

$toDelete = @()
foreach ($name in $orphans) {
    $path = Join-Path $worktreeDir $name
    if (-not (Test-Path $path)) {
        Write-Host "  [skip]    $name  - already gone" -ForegroundColor DarkGray
        continue
    }
    $isRegistered = $registered | Where-Object { $_ -ieq $path }
    if ($isRegistered) {
        Write-Host "  [REFUSE]  $name  - still registered with git, not an orphan" -ForegroundColor Red
        continue
    }
    if ($name -eq $active) {
        Write-Host "  [REFUSE]  $name  - active worktree, refusing" -ForegroundColor Red
        continue
    }
    $sizeMB = [math]::Round(((Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB), 1)
    Write-Host "  [delete]  $name  ($sizeMB MB)" -ForegroundColor Yellow
    $toDelete += $path
}

if ($toDelete.Count -eq 0) {
    Write-Host ''
    Write-Host 'Nothing to clean. Already tidy.' -ForegroundColor Green
    exit 0
}

if (-not $Force) {
    Write-Host ''
    $resp = Read-Host 'Proceed with deletion? (y/N)'
    if ($resp -notin @('y', 'Y')) {
        Write-Host 'Aborted.' -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ''
Write-Host 'Deleting...' -ForegroundColor Cyan
foreach ($path in $toDelete) {
    try {
        Remove-Item -Recurse -Force -LiteralPath $path -ErrorAction Stop
        Write-Host "  OK   $([System.IO.Path]::GetFileName($path))" -ForegroundColor Green
    } catch {
        Write-Host "  FAIL $([System.IO.Path]::GetFileName($path))  - $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "       hint: find the locker with:  handle.exe $path" -ForegroundColor DarkGray
        Write-Host "       or open Resource Monitor -> CPU -> Associated Handles -> search the folder name" -ForegroundColor DarkGray
    }
}

Write-Host ''
Write-Host 'Done.' -ForegroundColor Cyan
Write-Host 'Remaining under .claude\worktrees\:'
Get-ChildItem $worktreeDir -Directory | ForEach-Object { Write-Host "  $($_.Name)" }
