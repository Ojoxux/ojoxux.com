import { describe, expect, it } from "vitest";
import { formatDateRange, toActivity } from "../src/wakatime";

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
