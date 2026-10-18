#!/usr/bin/env bash
# 本番ビルド：API 型の生成 → WASM（最適化あり）→ Vite（ブラウザ + Worker）
# prod / staging の切り替えは WRANGLER_CONFIG で行う（未指定なら wrangler.jsonc）
set -euo pipefail
cd "$(dirname "$0")/.."

scripts/gen-types.sh
OPTIMIZE=1 scripts/build-wasm.sh
pnpm exec vite build
