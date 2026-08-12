#!/usr/bin/env bash
# Build a static export for GitHub Pages (no API / Postgres).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export NEXT_PUBLIC_STATIC_DEMO=true
# Project Pages URL: https://<user>.github.io/trading-card-studio/
export NEXT_PUBLIC_BASE_PATH="${NEXT_PUBLIC_BASE_PATH:-/trading-card-studio}"
export STATIC_EXPORT=true

API_DIR="app/api"
CAPTURE_DIR="app/capture-hero"
STASH_DIR=".static-exclude/api"
STASH_CAPTURE=".static-exclude/capture-hero"
mkdir -p .static-exclude

cleanup() {
  if [[ -d "$STASH_DIR" && ! -d "$API_DIR" ]]; then
    mv "$STASH_DIR" "$API_DIR"
    echo "Restored $API_DIR"
  fi
  if [[ -d "$STASH_CAPTURE" && ! -d "$CAPTURE_DIR" ]]; then
    mv "$STASH_CAPTURE" "$CAPTURE_DIR"
    echo "Restored $CAPTURE_DIR"
  fi
}
trap cleanup EXIT

if [[ -d "$API_DIR" ]]; then
  rm -rf "$STASH_DIR"
  mv "$API_DIR" "$STASH_DIR"
  echo "Stashed API routes for static export"
fi

if [[ -d "$CAPTURE_DIR" ]]; then
  rm -rf "$STASH_CAPTURE"
  mv "$CAPTURE_DIR" "$STASH_CAPTURE"
  echo "Stashed capture-hero page for static export"
fi

# features.ts hardcodes STATIC_DEMO=true; env reinforces client bundles
npx next build

echo ""
echo "Static site written to ./out"
echo "Preview: npx serve out"
echo "GitHub Pages base path: $NEXT_PUBLIC_BASE_PATH"
