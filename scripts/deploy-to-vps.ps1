# City Plus Pet Shop - Deploy to VPS from Windows
# Prerequisites: OpenSSH client (built-in on Windows 10/11)
# Usage: .\scripts\deploy-to-vps.ps1

$VPS_IP = "76.13.208.85"
$VPS_USER = "root"
$REMOTE_DIR = "/var/www/city-plus-pet-shop"
$PROJECT_ROOT = $PSScriptRoot + "\.."

Write-Host "=== Deploying to VPS $VPS_IP ===" -ForegroundColor Cyan

# 1. Create archive (exclude node_modules, .next, .git)
$exclude = @("node_modules", ".next", ".git", "*.log")
$tempArchive = Join-Path $PROJECT_ROOT "deploy-archive.tar.gz"

Write-Host "Creating archive..." -ForegroundColor Yellow
Push-Location $PROJECT_ROOT
if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar --exclude=node_modules --exclude=.next --exclude=.git --exclude=deploy-archive.tar.gz -czf $tempArchive .
} else {
    Write-Host "tar not found. Using manual instructions." -ForegroundColor Red
    $tempArchive = $null
}
Pop-Location

# 2. Upload via SCP
if ($tempArchive -and (Test-Path $tempArchive)) {
    Write-Host "Uploading archive..." -ForegroundColor Yellow
    scp $tempArchive "${VPS_USER}@${VPS_IP}:/tmp/$([System.IO.Path]::GetFileName($tempArchive))"
    scp "$PROJECT_ROOT\scripts\vps-deploy.sh" "${VPS_USER}@${VPS_IP}:/tmp/"
    scp "$PROJECT_ROOT\scripts\nginx-citypetshopbd.conf" "${VPS_USER}@${VPS_IP}:/tmp/"
    if (Test-Path "$PROJECT_ROOT\.env.production") {
        scp "$PROJECT_ROOT\.env.production" "${VPS_USER}@${VPS_IP}:/tmp/.env.production"
    } elseif (Test-Path "$PROJECT_ROOT\.env.local") {
        scp "$PROJECT_ROOT\.env.local" "${VPS_USER}@${VPS_IP}:/tmp/.env.production"
    }
    
    Write-Host "Extracting and deploying on server..." -ForegroundColor Yellow
    $archiveName = [System.IO.Path]::GetFileName($tempArchive)
    $remoteCmds = @"
mkdir -p $REMOTE_DIR
tar -xzf /tmp/$archiveName -C $REMOTE_DIR
cp /tmp/vps-deploy.sh $REMOTE_DIR/ 2>/dev/null || true
mkdir -p $REMOTE_DIR/scripts
cp /tmp/nginx-citypetshopbd.conf $REMOTE_DIR/scripts/ 2>/dev/null || true
cp /tmp/.env.production $REMOTE_DIR/ 2>/dev/null || true
cd $REMOTE_DIR
chmod +x vps-deploy.sh 2>/dev/null || true
sudo bash vps-deploy.sh
"@
    ssh "${VPS_USER}@${VPS_IP}" $remoteCmds
    Remove-Item $tempArchive -Force -ErrorAction SilentlyContinue
} else {
    # Fallback: rsync or manual upload
    Write-Host "Uploading via rsync (if available)..." -ForegroundColor Yellow
    if (Get-Command rsync -ErrorAction SilentlyContinue) {
        rsync -avz --exclude node_modules --exclude .next --exclude .git "$PROJECT_ROOT/" "${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/"
    } else {
        Write-Host ""
        Write-Host "Manual upload required:" -ForegroundColor Red
        Write-Host "1. Upload project to ${VPS_USER}@${VPS_IP}:${REMOTE_DIR}/" 
        Write-Host "   (exclude node_modules, .next)"
        Write-Host "2. SSH: ssh ${VPS_USER}@${VPS_IP}"
        Write-Host "3. Run: cd $REMOTE_DIR && sudo bash scripts/vps-deploy.sh"
        exit 1
    }
    ssh "${VPS_USER}@${VPS_IP}" "cd $REMOTE_DIR && sudo bash scripts/vps-deploy.sh"
}

Write-Host ""
Write-Host "=== Deploy complete! ===" -ForegroundColor Green
Write-Host "Site: https://citypetshopbd.com"
