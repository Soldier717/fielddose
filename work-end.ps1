# work-end.ps1 — finish a work session: commit local changes, sync with GitHub, push.
# Usage:  .\work-end.ps1            (auto commit message with date + machine name)
#         .\work-end.ps1 "message"  (your own commit message)
# Safe to run on both laptop and office computer.

param([string]$Message)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot   # always operate on this repo, no matter where it's run from

Write-Host "== work-end: syncing FieldDose with GitHub ==" -ForegroundColor Cyan

# 1. Stage everything and commit (only if there are changes)
git add -A
$changes = git status --porcelain
if ($changes) {
    if (-not $Message) {
        $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
        $Message = "Work session $stamp on $env:COMPUTERNAME"
    }
    git commit -m $Message
    Write-Host "Committed: $Message" -ForegroundColor Green
} else {
    Write-Host "No local changes to commit." -ForegroundColor Yellow
}

# 2. Pull in anything the other machine pushed (rebase keeps history clean)
git pull --rebase --autostash
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Pull hit a CONFLICT (both machines edited the same lines)." -ForegroundColor Red
    Write-Host "Fix the marked files, then run:  git add -A; git rebase --continue; git push" -ForegroundColor Red
    exit 1
}

# 3. Push your work up
git push
if ($LASTEXITCODE -eq 0) {
    Write-Host "Pushed to GitHub. Safe to switch machines." -ForegroundColor Green
} else {
    Write-Host "Push failed - see the error above." -ForegroundColor Red
    exit 1
}
