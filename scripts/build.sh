#!/usr/bin/env bash
# 本番ビルド：API 型の生成 → Vite（ブラウザ + Worker）
# prod / staging の切り替えは WRANGLER_CONFIG で行う（未指定なら wrangler.jsonc）
set -euo pipefail
cd "$(dirname "$0")/.."

scripts/gen-types.sh
pnpm exec vite build
