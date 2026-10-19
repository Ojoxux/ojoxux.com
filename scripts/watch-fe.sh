#!/usr/bin/env bash
# Haskell の変更を監視して WASM を再ビルドする。
# fe/wasm-out が更新されると、pnpm dev 側の Vite がページをフルリロードする。
set -euo pipefail
cd "$(dirname "$0")/.."

exec watchexec \
  --watch fe/app --watch fe/src --watch fe/core --watch shared/src \
  --watch fe/fe.cabal --watch shared/ojoxux-api.cabal --watch cabal.project \
  --exts hs,cabal,project \
  --debounce 300ms \
  -- scripts/build-wasm.sh
