import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		// prod / staging の設定ファイルは WRANGLER_CONFIG で切り替える
		cloudflare({ configPath: process.env.WRANGLER_CONFIG ?? "wrangler.jsonc" }),
	],
	server: {
		watch: {
			ignored: ["**/dist-newstyle/**", "**/dist-wasm/**"],
		},
	},
});
