import { ConsoleStdout, File, OpenFile, WASI } from "@bjorn3/browser_wasi_shim";
import wasmUrl from "../wasm-out/fe.wasm?url";
import ghcWasmJsffi from "../wasm-out/ghc_wasm_jsffi.js";
import "../styles.css";

type ReactorInstance = {
	exports: {
		memory: WebAssembly.Memory;
		_initialize: () => unknown;
		hs_start: () => Promise<void>;
	};
};

async function boot(): Promise<void> {
	const wasi = new WASI(
		[],
		["GHCRTS=-H64m"],
		[
			new OpenFile(new File([])),
			ConsoleStdout.lineBuffered((msg) => console.log(`[WASI stdout] ${msg}`)),
			ConsoleStdout.lineBuffered((msg) => console.warn(`[WASI stderr] ${msg}`)),
		],
	);

	// ghc_wasm_jsffi は instance の exports を後から参照するので、先に空の入れ物を渡す
	const instanceExports: WebAssembly.Exports = {};
	const { instance } = await WebAssembly.instantiateStreaming(fetch(wasmUrl), {
		wasi_snapshot_preview1: wasi.wasiImport,
		ghc_wasm_jsffi: ghcWasmJsffi(instanceExports),
	});
	Object.assign(instanceExports, instance.exports);

	const reactor = instance as unknown as ReactorInstance;
	wasi.initialize(reactor);
	await reactor.exports.hs_start();

	// Miso が #app に描画し終えたら、起動前のスケルトンを外す
	document.getElementById("boot")?.remove();
}

boot().catch((error: unknown) => {
	console.error("Failed to start app:", error);
});
