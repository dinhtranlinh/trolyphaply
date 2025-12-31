# ============================================
# SCRIPT FIX FACEBOOK ROUTE SLUG CONFLICTS
# Chạy script này để sửa lỗi "different slug names"
# ============================================

param(
    [string]$SourcePath = "D:\DTL\trolyphaply",
    [string]$ProdPath = "D:\DTL\trolyphaply-prod-release"
)

Write-Host "=== FACEBOOK ROUTE SLUG FIX SCRIPT ===" -ForegroundColor Cyan
Write-Host ""

# Danh sách các folder [pageId] cần xóa (sẽ giữ lại [id])
$foldersToDelete = @(
    "app\api\facebook\cooldown\[pageId]",
    "app\api\facebook\pages\[pageId]"
)

# 1. Xóa folders trong SOURCE
Write-Host "STEP 1: Xóa [pageId] folders trong SOURCE..." -ForegroundColor Yellow
foreach ($folder in $foldersToDelete) {
    $fullPath = Join-Path $SourcePath $folder
    if (Test-Path $fullPath) {
        Remove-Item -Path $fullPath -Recurse -Force
        Write-Host "  ✓ Deleted: $fullPath" -ForegroundColor Green
    } else {
        Write-Host "  - Not found: $fullPath" -ForegroundColor Gray
    }
}

# 2. Xóa folders trong PROD
Write-Host ""
Write-Host "STEP 2: Xóa [pageId] folders trong PROD..." -ForegroundColor Yellow
foreach ($folder in $foldersToDelete) {
    $fullPath = Join-Path $ProdPath $folder
    if (Test-Path $fullPath) {
        Remove-Item -Path $fullPath -Recurse -Force
        Write-Host "  ✓ Deleted: $fullPath" -ForegroundColor Green
    } else {
        Write-Host "  - Not found: $fullPath" -ForegroundColor Gray
    }
}

# 3. Xóa folder app\app nếu tồn tại (duplicate)
Write-Host ""
Write-Host "STEP 3: Xóa app\app duplicate folders..." -ForegroundColor Yellow
$appAppSource = Join-Path $SourcePath "app\app"
$appAppProd = Join-Path $ProdPath "app\app"

if (Test-Path $appAppSource) {
    Remove-Item -Path $appAppSource -Recurse -Force
    Write-Host "  ✓ Deleted: $appAppSource" -ForegroundColor Green
}
if (Test-Path $appAppProd) {
    Remove-Item -Path $appAppProd -Recurse -Force
    Write-Host "  ✓ Deleted: $appAppProd" -ForegroundColor Green
}

# 4. Xóa .next cache trong cả 2 folders
Write-Host ""
Write-Host "STEP 4: Xóa .next cache..." -ForegroundColor Yellow
$nextSource = Join-Path $SourcePath ".next"
$nextProd = Join-Path $ProdPath ".next"

if (Test-Path $nextSource) {
    Remove-Item -Path $nextSource -Recurse -Force
    Write-Host "  ✓ Deleted: $nextSource" -ForegroundColor Green
}
if (Test-Path $nextProd) {
    Remove-Item -Path $nextProd -Recurse -Force
    Write-Host "  ✓ Deleted: $nextProd" -ForegroundColor Green
}

# 5. Verify - Kiểm tra không còn [pageId] nào
Write-Host ""
Write-Host "STEP 5: Verifying no [pageId] folders remain..." -ForegroundColor Yellow

$remainingSource = Get-ChildItem -Path $SourcePath -Recurse -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq "[pageId]" }
$remainingProd = Get-ChildItem -Path $ProdPath -Recurse -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq "[pageId]" }

if ($remainingSource) {
    Write-Host "  ⚠ Still found in SOURCE:" -ForegroundColor Red
    $remainingSource | ForEach-Object { Write-Host "    - $($_.FullName)" -ForegroundColor Red }
} else {
    Write-Host "  ✓ No [pageId] in SOURCE" -ForegroundColor Green
}

if ($remainingProd) {
    Write-Host "  ⚠ Still found in PROD:" -ForegroundColor Red
    $remainingProd | ForEach-Object { Write-Host "    - $($_.FullName)" -ForegroundColor Red }
} else {
    Write-Host "  ✓ No [pageId] in PROD" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== SCRIPT COMPLETED ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. cd D:\DTL\trolyphaply" -ForegroundColor White
Write-Host "2. npm run build" -ForegroundColor White
Write-Host "3. Copy-Item -Path '.next' -Destination 'D:\DTL\trolyphaply-prod-release\.next' -Recurse -Force" -ForegroundColor White
Write-Host "4. npx pm2 restart trolyphaply-prod" -ForegroundColor White
