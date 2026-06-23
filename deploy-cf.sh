#!/usr/bin/env bash
# deploy-cf.sh — deploy this repo to Cloudflare Pages (project: connorwithhonor).
#
# This site moved off Netlify to Cloudflare Pages on 2026-06-22. The domain
# connorwithhonor.com (+ www) now CNAMEs to connorwithhonor.pages.dev (DNS in
# HonorElevate's CF backend; Zoho MX untouched). Deploys use the wrangler OAuth
# session (pages:write) on this box — no static Pages token is needed.
#
# Usage:  ./deploy-cf.sh            (deploys current committed main)
# Requires: wrangler logged in (wrangler login) on this machine.
set -euo pipefail

PROJECT="connorwithhonor"
ACCOUNT_ID="8d19fd09c66903840c347da43306673e"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAGE="$(mktemp -d)"

cd "$REPO_DIR"

# Export tracked files only, excluding internal/host files (never published).
git archive --format=tar main \
  ':!CLAUDE.md' ':!claude.md' ':!netlify.toml' ':!.github' \
  ':!.gitattributes' ':!.gitignore' ':!deploy-cf.sh' ':!scripts' \
  | tar -x -C "$STAGE"

# --- Anti-wipe guard (lesson from the 2026-05-21 5-site wipe) ---
count=$(find "$STAGE" -type f | wc -l)
if [ "$count" -lt 20 ]; then
  echo "ABORT: only $count files staged — suspiciously small, refusing to deploy." >&2
  exit 1
fi
if [ ! -f "$STAGE/index.html" ] || [ "$(wc -c < "$STAGE/index.html")" -lt 500 ]; then
  echo "ABORT: index.html missing or under 500 bytes." >&2
  exit 1
fi
if ! head -c 200 "$STAGE/index.html" | grep -qiE '<(!doctype|html)'; then
  echo "ABORT: index.html does not look like HTML." >&2
  exit 1
fi
echo "Guard passed: $count files, index.html looks like HTML."

CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID" \
  wrangler pages deploy "$STAGE" --project-name "$PROJECT" --branch main --commit-dirty=true

echo "Deployed $PROJECT. Live: https://connorwithhonor.com/"
