import { afterEach, describe, expect, it, vi } from "vitest";
import {
	fetchWakaTimeActivity,
	formatDateRange,
	toActivity,
} from "../src/wakatime";

describe("formatDateRange", () => {
	it("JST の月/日で範囲を整形する", () => {
		expect(
			formatDateRange("2026-10-11T15:00:00Z", "2026-10-18T14:59:59Z"),
		).toBe("10/12 – 10/18");
	});
});

describe("toActivity", () => {
	const language = (name: string, percent: number) => ({
		name,
		text: `${percent} mins`,
		percent,
	});

	it("percent が 0 の言語を除き、最大 6 件に絞る", () => {
		const activity = toActivity({
			data: {
				start: "2026-10-11T15:00:00Z",
				end: "2026-10-18T14:59:59Z",
				human_readable_total: "12 hrs 3 mins",
				languages: [
					language("Haskell", 40),
					language("TypeScript", 20),
					language("Other", 0),
					language("Nix", 10),
					language("CSS", 8),
					language("Markdown", 7),
					language("YAML", 6),
					language("JSON", 5),
				],
			},
		});

		expect(activity.totalText).toBe("12 hrs 3 mins");
		expect(activity.rangeText).toBe("10/12 – 10/18");
		expect(activity.languages.map((l) => l.name)).toEqual([
			"Haskell",
			"TypeScript",
			"Nix",
			"CSS",
			"YAML",
			"JSON",
		]);
		expect(activity.languages[0]).toEqual({
			name: "Haskell",
			text: "40 mins",
			percent: 40,
		});
	});

	it("Markdown と Other は percent があっても除く", () => {
		const activity = toActivity({
			data: {
				start: "2026-10-11T15:00:00Z",
				end: "2026-10-18T14:59:59Z",
				human_readable_total: "1 hr",
				languages: [
					language("Markdown", 50),
					language("Haskell", 30),
					language("Other", 20),
				],
			},
		});

		expect(activity.languages.map((l) => l.name)).toEqual(["Haskell"]);
	});
});

describe("fetchWakaTimeActivity", () => {
	const stats = {
		data: {
			start: "2026-10-11T15:00:00Z",
			end: "2026-10-18T14:59:59Z",
			human_readable_total: "1 hr",
			languages: [],
		},
	};

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("アクセストークンを Bearer で送る", async () => {
		const fetchMock = vi.fn(async (_url: URL, _init: RequestInit) =>
			Response.json(stats),
		);
		vi.stubGlobal("fetch", fetchMock);

		const activity = await fetchWakaTimeActivity("token-123");

		expect(activity?.totalText).toBe("1 hr");
		const init = fetchMock.mock.calls[0]?.[1];
		expect(new Headers(init?.headers).get("Authorization")).toBe(
			"Bearer token-123",
		);
	});

	it("通信失敗のあとに再試行して取得できる", async () => {
		const fetchMock = vi
			.fn()
			.mockRejectedValueOnce(new TypeError("network failed"))
			.mockResolvedValueOnce(Response.json(stats));
		vi.stubGlobal("fetch", fetchMock);

		expect(await fetchWakaTimeActivity("token-123")).toMatchObject({
			totalText: "1 hr",
		});
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("503 が続いたら再試行は1回で止め、ステータスだけを記録する", async () => {
		const fetchMock = vi.fn(
			async () => new Response("private body", { status: 503 }),
		);
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.stubGlobal("fetch", fetchMock);

		expect(await fetchWakaTimeActivity("token-123")).toBeNull();
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(log).toHaveBeenCalledExactlyOnceWith(
			"Failed to fetch WakaTime stats:",
			{
				reason: "WakaTimeStatusError",
				status: 503,
			},
		);
	});

	it.each([401, 403, 429])("%i では再試行しない", async (status) => {
		const fetchMock = vi.fn(
			async () => new Response("private body", { status }),
		);
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.stubGlobal("fetch", fetchMock);

		expect(await fetchWakaTimeActivity("token-123")).toBeNull();
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(log).toHaveBeenCalledExactlyOnceWith(
			"Failed to fetch WakaTime stats:",
			{
				reason: "WakaTimeStatusError",
				status,
			},
		);
	});

	it.each([
		["不正な JSON", "not JSON"],
		[
			"型が合わない JSON",
			JSON.stringify({ data: { ...stats.data, languages: null } }),
		],
		[
			"日付が不正な JSON",
			JSON.stringify({ data: { ...stats.data, start: "" } }),
		],
	])("%s は再試行せず Schema のエラーを記録する", async (_name, body) => {
		const fetchMock = vi.fn(async () => new Response(body));
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.stubGlobal("fetch", fetchMock);

		expect(await fetchWakaTimeActivity("token-123")).toBeNull();
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(log).toHaveBeenCalledExactlyOnceWith(
			"Failed to fetch WakaTime stats:",
			{
				reason: "SchemaError",
			},
		);
	});

	it("本文の読み取りが止まっても各リクエストを中断できる", async () => {
		vi.useFakeTimers();
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		const fetchMock = vi.fn(
			async (_url: URL, { signal }: RequestInit) =>
				new Response(
					new ReadableStream({
						start(controller) {
							signal?.addEventListener(
								"abort",
								() => controller.error(signal.reason),
								{
									once: true,
								},
							);
						},
					}),
				),
		);
		vi.stubGlobal("fetch", fetchMock);

		const activity = fetchWakaTimeActivity("token-123");
		await vi.advanceTimersByTimeAsync(3250);
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock.mock.calls[0]?.[1].signal?.aborted).toBe(true);

		await vi.advanceTimersByTimeAsync(3000);
		expect(await activity).toBeNull();
		expect(fetchMock.mock.calls[1]?.[1].signal?.aborted).toBe(true);
		expect(log).toHaveBeenCalledExactlyOnceWith(
			"Failed to fetch WakaTime stats:",
			{
				reason: "TimeoutError",
			},
		);
	});
});
