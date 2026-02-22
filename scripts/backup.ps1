# Daily backup: PostgreSQL + media uploads (Windows)
# Usage: .\scripts\backup.ps1 [-RetentionDays 7]
# Requires: DATABASE_URL in env, UPLOAD_DIR (default: .\uploads)

param([int]$RetentionDays = 7)

$BackupDir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { ".\backups" }
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

if ($env:DATABASE_URL) {
    Write-Host "[backup] Dumping PostgreSQL..."
    $dbPath = Join-Path $BackupDir "db_$Timestamp.dump"
    & pg_dump $env:DATABASE_URL --no-owner --no-acl -Fc -f $dbPath
    Write-Host "[backup] DB dump: $dbPath"
} else {
    Write-Host "[backup] DATABASE_URL not set, skipping DB backup"
}

$UploadDir = if ($env:UPLOAD_DIR) { $env:UPLOAD_DIR } else { ".\uploads" }
if (Test-Path $UploadDir) {
    Write-Host "[backup] Archiving media..."
    $mediaPath = Join-Path $BackupDir "media_$Timestamp.zip"
    Compress-Archive -Path $UploadDir -DestinationPath $mediaPath -Force
    Write-Host "[backup] Media archive: $mediaPath"
} else {
    Write-Host "[backup] UPLOAD_DIR not found, skipping media backup"
}

Write-Host "[backup] Pruning backups older than $RetentionDays days..."
Get-ChildItem $BackupDir -Filter "db_*.dump" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } | Remove-Item -Force
Get-ChildItem $BackupDir -Filter "media_*.zip" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } | Remove-Item -Force

Write-Host "[backup] Done."
