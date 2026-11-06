import type { WakaTimeActivity } from "./generated/api";

export type WakaTimeStatsResponse = {
	data: {
		start: string;
		end: string;
		human_readable_total: string;
		languages: Array<{
			name: string;
			text: string;
			percent: number;
		}>;
	};
};

export const EMPTY_ACTIVITY: WakaTimeActivity = {
	rangeText: "",
	totalText: "",
	languages: [],
};

export const MOCK_ACTIVITY: WakaTimeActivity = {
	rangeText: "10/31 – 11/6",
	totalText: "12 hrs 34 mins",
	languages: [
		{ name: "Haskell", text: "5 hrs 2 mins", percent: 40 },
		{ name: "TypeScript", text: "3 hrs 46 mins", percent: 30 },
		{ name: "Nix", text: "1 hr 53 mins", percent: 15 },
		{ name: "CSS", text: "1 hr 15 mins", percent: 10 },
		{ name: "YAML", text: "38 mins", percent: 5 },
	],
};

const WAKATIME_STATS_URL =
	"https://wakatime.com/api/v1/users/current/stats/last_7_days";
const MAX_LANGUAGES = 6;
const EXCLUDED_LANGUAGES = new Set(["Markdown", "Other"]);

const DATE_RANGE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
	timeZone: "Asia/Tokyo",
	month: "numeric",
	day: "numeric",
});

export function formatDateRange(startIso: string, endIso: string): string {
	const start = DATE_RANGE_FORMATTER.format(new Date(startIso));
	const end = DATE_RANGE_FORMATTER.format(new Date(endIso));

	return `${start} – ${end}`;
}

export function toActivity(json: WakaTimeStatsResponse): WakaTimeActivity {
	return {
		rangeText: formatDateRange(json.data.start, json.data.end),
		totalText: json.data.human_readable_total,
		languages: json.data.languages
			.filter(
				(language) =>
					language.percent > 0 && !EXCLUDED_LANGUAGES.has(language.name),
			)
			.slice(0, MAX_LANGUAGES)
			.map((language) => ({
				name: language.name,
				text: language.text,
				percent: language.percent,
			})),
	};
}

// 失敗時は null を返す（呼び出し側でキャッシュせずに空データを返す）
export async function fetchWakaTimeActivity(
	accessToken: string,
): Promise<WakaTimeActivity | null> {
	try {
		const response = await fetch(WAKATIME_STATS_URL, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"User-Agent": "ojoxux.com (+https://ojoxux.com)",
			},
		});

		if (!response.ok) {
			// 401/403/429 などを区別できるよう、本文の先頭もログに残す
			const body = (await response.text()).slice(0, 300);
			throw new Error(
				`WakaTime API responded with ${response.status}: ${body}`,
			);
		}

		return toActivity((await response.json()) as WakaTimeStatsResponse);
	} catch (error) {
		console.error("Failed to fetch WakaTime stats:", error);
		return null;
	}
}
