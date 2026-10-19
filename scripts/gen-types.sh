#!/usr/bin/env bash
# Haskell の API 型から worker/src/generated/api.ts を生成する
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p worker/src/generated
cabal run -v0 ojoxux-api:exe:gen-ts -- worker/src/generated/api.ts
