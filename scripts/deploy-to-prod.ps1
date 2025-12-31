<#
.SYNOPSIS
    Deploy code from Dev to Production

.DESCRIPTION
    This script copies changed files from dev to prod,
    builds, and restarts the production server.

.USAGE
    .\scripts\deploy-to-prod.ps1
    .\scripts\deploy-to-prod.ps1 -SkipBuild
    .\scripts\deploy-to-prod.ps1 -DryRun
#>

param(
    [switch]$SkipBuild,
    [switch]$DryRun,
    [string]$DevPath = "D:\DTL\trolyphaply",
    [string]$ProdPath = "D:\DTL\trolyphaply-prod-release"
)

$ErrorActionPreference = "Stop"

Write-Host "DEPLOY TO PRODUCTION" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host "Dev:  $DevPath"
Write-Host "Prod: $ProdPath"
if ($DryRun) { Write-Host "DRY RUN MODE - No changes will be made" -ForegroundColor Yellow }
Write-Host ""

# Files/folders to sync (using -LiteralPath for special chars like [id])
$syncItems = @(
    # Facebook automation
    "app\admin\facebook\message-rules",
    "app\admin\facebook\connection",
    "app\admin\facebook\pages",
    "app\admin\facebook\reply-rules",
    "app\api\facebook\connection",
    "app\api\facebook\message-rules",
    "app\api\facebook\reply-rules",
    "app\api\facebook\webhooks",
    "lib\facebook",
    "types\facebook-schemas.ts",
    "types\facebook-automation.ts",

    # Core libs
    "lib\ai.ts",
    "lib\gemini.ts",
    "lib\supabase.ts",

    # Components
    "components\facebook"
)

$copiedFiles = 0
$errors = @()

foreach ($item in $syncItems) {
    $srcPath = Join-Path $DevPath $item
    $dstPath = Join-Path $ProdPath $item

    if (Test-Path -LiteralPath $srcPath) {
        $isDirectory = (Get-Item -LiteralPath $srcPath).PSIsContainer

        if ($isDirectory) {
            Write-Host "Syncing folder: $item" -ForegroundColor Blue

            # Get all files recursively
            $files = Get-ChildItem -LiteralPath $srcPath -Recurse -File

            foreach ($file in $files) {
                $relativePath = $file.FullName.Substring($srcPath.Length + 1)
                $dstFile = Join-Path $dstPath $relativePath
                $dstDir = Split-Path $dstFile -Parent

                if (-not $DryRun) {
                    if (-not (Test-Path -LiteralPath $dstDir)) {
                        New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
                    }
                    Copy-Item -LiteralPath $file.FullName -Destination $dstFile -Force
                }

                Write-Host "   OK  $relativePath" -ForegroundColor Green
                $copiedFiles++
            }
        }
        else {
            Write-Host "Copying file: $item" -ForegroundColor Blue

            if (-not $DryRun) {
                $dstDir = Split-Path $dstPath -Parent
                if (-not (Test-Path -LiteralPath $dstDir)) {
                    New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
                }
                Copy-Item -LiteralPath $srcPath -Destination $dstPath -Force
            }

            Write-Host "   OK  Copied" -ForegroundColor Green
            $copiedFiles++
        }
    }
    else {
        Write-Host "WARN Not found: $item" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Copied $copiedFiles files" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host ""
    Write-Host "Dry run complete. Use without -DryRun to actually deploy." -ForegroundColor Yellow
    exit 0
}

# Build
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "Building production..." -ForegroundColor Cyan

    Push-Location $ProdPath
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed with exit code $LASTEXITCODE"
        }
        Write-Host "Build successful" -ForegroundColor Green
    }
    catch {
        Write-Host "Build failed: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
}

# Restart PM2
Write-Host ""
Write-Host "Restarting production server..." -ForegroundColor Cyan

npx pm2 restart trolyphaply-prod --update-env

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
    Write-Host "   - Files copied: $copiedFiles"
    Write-Host "   - Build: $(if ($SkipBuild) { 'Skipped' } else { 'Success' })"
    Write-Host "   - Server: Restarted"
}
else {
    Write-Host "Failed to restart server" -ForegroundColor Red
    exit 1
}
