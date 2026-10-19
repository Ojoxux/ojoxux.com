import { afterEach, describe, expect, it, vi } from "vitest";
import { withCache } from "../src/cache";

type CacheStub = {
	match: ReturnType<typeof vi.fn>;
	put: ReturnType<typeof vi.fn>;
};

function stubCaches(stub: CacheStub) {
	vi.stubGlobal("caches", { default: stub });
}

describe("withCache", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("キャッシュの読み取りが失敗したら load の結果を返す", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		stubCaches({
			match: vi.fn(async () => {
				throw new Error("boom");
			}),
			put: vi.fn(async () => undefined),
		});

		await expect(withCache("k", 60, async () => "v")).resolves.toBe("v");
	});

	it("キャッシュへの書き込みが失敗しても load の結果を返す", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		stubCaches({
			match: vi.fn(async () => undefined),
			put: vi.fn(async () => {
				throw new Error("boom");
			}),
		});

		await expect(withCache("k", 60, async () => "v")).resolves.toBe("v");
	});

	it("load のエラーは呼び出し元へ伝播する", async () => {
		stubCaches({
			match: vi.fn(async () => undefined),
			put: vi.fn(async () => undefined),
		});

		await expect(
			withCache("k", 60, async () => {
				throw new Error("load-fail");
			}),
		).rejects.toThrow("load-fail");
	});

	it("load が null を返したときはキャッシュに書き込まない", async () => {
		const put = vi.fn(async () => undefined);
		stubCaches({
			match: vi.fn(async () => undefined),
			put,
		});

		await expect(withCache("k", 60, async () => null)).resolves.toBeNull();
		expect(put).not.toHaveBeenCalled();
	});
});
