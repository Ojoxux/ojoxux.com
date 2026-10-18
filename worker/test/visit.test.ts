import { afterEach, describe, expect, it, vi } from "vitest";
import app from "../src/index";

type DbStub = {
	prepare: ReturnType<typeof vi.fn>;
};

function createEnv(db: DbStub) {
	return {
		DB: db,
		ASSETS: { fetch: vi.fn() },
	} as unknown as Parameters<typeof app.request>[2];
}

function createDbStub(): DbStub {
	return {
		prepare: vi.fn(() => ({
			bind: () => ({
				first: async () => ({ count: 101 }),
			}),
		})),
	};
}

const VISIT_URL = "https://ojoxux.com/api/visit";

describe("POST /api/visit", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("別オリジンからのフォーム POST は 403 で、D1 を更新しない", async () => {
		const db = createDbStub();
		const res = await app.request(
			VISIT_URL,
			{
				method: "POST",
				headers: {
					Origin: "https://unrelated.example",
					"Sec-Fetch-Site": "cross-site",
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: "a=1",
			},
			createEnv(db),
		);

		expect(res.status).toBe(403);
		expect(db.prepare).not.toHaveBeenCalled();
	});

	it("別オリジンからの text/plain POST も拒否する", async () => {
		const db = createDbStub();
		const res = await app.request(
			VISIT_URL,
			{
				method: "POST",
				headers: {
					Origin: "https://unrelated.example",
					"Content-Type": "text/plain",
				},
				body: "[]",
			},
			createEnv(db),
		);

		expect(res.status).toBe(403);
		expect(db.prepare).not.toHaveBeenCalled();
	});

	it("同一オリジンからの JSON POST はカウントを返す", async () => {
		const db = createDbStub();
		const res = await app.request(
			VISIT_URL,
			{
				method: "POST",
				headers: {
					Origin: "https://ojoxux.com",
					"Content-Type": "application/json",
				},
				body: "[]",
			},
			createEnv(db),
		);

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ count: 101 });
		expect(db.prepare).toHaveBeenCalledTimes(1);
	});
});
