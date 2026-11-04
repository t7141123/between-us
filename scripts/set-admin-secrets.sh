#!/usr/bin/env bash
# Generates a fresh salt + admin password and stores them as Cloudflare Pages secrets.
# Usage: bash scripts/set-admin-secrets.sh [admin-username]
# The password is printed ONCE at the end — save it in a password manager.
set -euo pipefail
PROJECT="${PAGES_PROJECT:-love-between-us}"
USER_NAME="${1:-admin}"
SALT="$(openssl rand -hex 24)"
PASS="$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)"
UH="$(printf '%s' "$USER_NAME:$SALT" | shasum -a 256 | cut -d' ' -f1)"
PH="$(printf '%s' "$PASS:$SALT" | shasum -a 256 | cut -d' ' -f1)"
printf '%s' "$SALT" | npx wrangler pages secret put SECRET_SALT --project-name "$PROJECT"
printf '%s' "$UH"   | npx wrangler pages secret put ADMIN_USER_HASH --project-name "$PROJECT"
printf '%s' "$PH"   | npx wrangler pages secret put ADMIN_PASS_HASH --project-name "$PROJECT"
if [ "$USER_NAME" != "admin" ]; then
  printf '%s' "$USER_NAME" | npx wrangler pages secret put ADMIN_USER --project-name "$PROJECT"
fi
echo
echo "Admin login  ->  username: $USER_NAME   password: $PASS"
