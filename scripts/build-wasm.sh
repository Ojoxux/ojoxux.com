#!/usr/bin/env bash
# fe を GHC WASM でビルドし、fe/wasm-out/ に .wasm と JS FFI グルーを置く。
# OPTIMIZE=1 のときは wasm-opt と strip でサイズを削る（本番ビルド用）。
set -euo pipefail
cd "$(dirname "$0")/.."

out=fe/wasm-out
mkdir -p "$out"

wasm32-wasi-cabal --builddir=dist-wasm build exe:fe
wasm=$(wasm32-wasi-cabal --builddir=dist-wasm list-bin exe:fe | tail -n 1)

"$(wasm32-wasi-ghc --print-libdir)/post-link.mjs" \
  --input "$wasm" \
  --output "$out/ghc_wasm_jsffi.js"
cp "$wasm" "$out/fe.wasm"

# post-link.mjs の出力には型が無いので、main.ts から import するための宣言を置く
cat > "$out/ghc_wasm_jsffi.d.ts" <<'DTS'
declare const ghcWasmJsffi: (
  exports: WebAssembly.Exports,
) => WebAssembly.ModuleImports;
export default ghcWasmJsffi;
DTS

if [[ "${OPTIMIZE:-0}" == "1" ]]; then
  # binaryen の -all は compact imports も有効にするが、ブラウザはまだ読めないので外す
  wasm-opt -all --disable-compact-imports -O2 "$out/fe.wasm" -o "$out/fe.wasm"
  wasm-tools strip -o "$out/fe.wasm" "$out/fe.wasm"
  # 最適化後の .wasm を V8 でコンパイルできるか確かめる（ブラウザで読めない出力を早めに検出する）
  node -e 'WebAssembly.compile(require("fs").readFileSync(process.argv[1])).catch((e) => { console.error(e.message); process.exit(1); })' "$out/fe.wasm"
fi
