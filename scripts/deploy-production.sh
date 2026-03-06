#!/usr/bin/env bash
# Canonical deploy entrypoint — delegates to deploy/deploy-production.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
cd "$APP_DIR" && exec bash "$APP_DIR/deploy/deploy-production.sh"
