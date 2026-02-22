# GitHub Secrets Setup — City Plus Pet Shop

Configure these secrets at: **GitHub → Settings → Secrets and variables → Actions**

---

## Required Secrets

| Secret Name | Where to get it | Example |
|---|---|---|
| `STAGING_HOST` | Staging VPS IP address | `123.45.67.89` |
| `STAGING_SSH_KEY` | Output of `setup-staging-server.sh` | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `STAGING_SSH_PORT` | Usually `22` | `22` |
| `PRODUCTION_HOST` | Production VPS IP address | `98.76.54.32` |
| `PRODUCTION_SSH_KEY` | Private key for `cityplus` user (see below) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `PRODUCTION_SSH_PORT` | Usually `22` | `22` |

---

## Generate Production SSH Deploy Key

Run this **on the production server** as `abrar`:

```bash
sudo -u cityplus ssh-keygen -t ed25519 -C "github-actions-production" \
  -f /home/cityplus/.ssh/deploy_ed25519 -N ""

cat /home/cityplus/.ssh/deploy_ed25519.pub \
  >> /home/cityplus/.ssh/authorized_keys

sudo chmod 600 /home/cityplus/.ssh/authorized_keys
sudo chown cityplus:cityplus /home/cityplus/.ssh/authorized_keys

# Print the private key — copy this to GitHub Secret PRODUCTION_SSH_KEY
sudo cat /home/cityplus/.ssh/deploy_ed25519
```

---

## Generate Staging SSH Deploy Key

Run `setup-staging-server.sh` — it auto-generates and prints the key.

---

## GitHub Environments Setup

Create two environments at **GitHub → Settings → Environments**:

### `staging`
- No required reviewers
- No wait timer
- Branch policy: `develop` only

### `production`
- **Required reviewers**: add `abrar` (and any other approvers)
- **Wait timer**: 0 minutes (approval dialog is the gate)
- Branch policy: `main` only

---

## How Deployments Work

| Trigger | Target | Approval |
|---|---|---|
| Push to `develop` | Staging (auto) | None |
| `workflow_dispatch` → staging | Staging | None |
| `workflow_dispatch` → production | Production | **Required reviewer approval** |

### Trigger production deploy:

1. Merge your feature branch to `main`
2. Go to GitHub → Actions → **Deploy — City Plus Pet Shop**
3. Click **Run workflow** → select `production` → click **Run workflow**
4. A reviewer (abrar) must approve in the environment protection dialog
5. Deploy runs automatically after approval

---

## Rollback (manual)

SSH to production as `cityplus`:

```bash
# Use the most recent rollback snapshot (auto-detected)
bash /var/www/cityplus/app/deploy/rollback.sh

# Or specify a specific snapshot
bash /var/www/cityplus/app/deploy/rollback.sh /var/backups/cityplus/rollback_20260222_120000
```

---

## Checklist Before First Deploy

- [ ] `setup-staging-server.sh` run on staging server
- [ ] Staging `PRODUCTION_SSH_KEY` and `STAGING_SSH_KEY` added to GitHub Secrets
- [ ] Production sudoers file installed: `sudo cp deploy/sudoers-cityplus.conf /etc/sudoers.d/cityplus && sudo chmod 440 /etc/sudoers.d/cityplus`
- [ ] Production `.env.production.local` created with real values
- [ ] Staging `.env.staging.local` created with staging values
- [ ] GitHub environments `staging` and `production` created
- [ ] `production` environment has required reviewer set
- [ ] Test staging deploy by pushing to `develop`
- [ ] Test production deploy via `workflow_dispatch`
