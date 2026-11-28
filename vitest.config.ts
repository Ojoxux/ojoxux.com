import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: [
			"worker/test/**/*.test.ts",
			"fe/src/**/*.test.ts",
			"shared/**/*.test.ts",
		],
		environment: "node",
	},
});
