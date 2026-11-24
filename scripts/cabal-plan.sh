#!/usr/bin/env bash
# ネイティブと WASM それぞれで解決される依存のバージョンを標準出力に出す。
# index-state を進めたときに解決結果が変わるかを比べるために使う。
set -euo pipefail
cd "$(dirname "$0")/.."

# cabal freeze は cabal.project.freeze を書き出すので、終わったら消す
trap 'rm -f cabal.project.freeze' EXIT

# index-state と active-repositories の行は比較に要らないので落とす
strip() { grep -vE '^(index-state|active-repositories):'; }

# 前回の freeze が残っていると、それが制約として読まれてしまうので毎回消す
rm -f cabal.project.freeze
echo "# native"
cabal freeze --enable-tests >/dev/null
strip < cabal.project.freeze

rm -f cabal.project.freeze
echo "# wasm"
wasm32-wasi-cabal --builddir=dist-wasm freeze >/dev/null
strip < cabal.project.freeze
