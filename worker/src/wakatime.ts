import { Data, Effect, Schedule, Schema } from "effect";
import {
	type WakaTimeActivity,
	WakaTimeLanguage,
} from "../../shared/api-schema";

const DateString = Schema.String.check(
	Schema.makeFilter((value: string) => Number.isFinite(Date.parse(value)), {
		expected: "a valid date string",
	}),
);

const WakaTimeStatsResponse = Schema.Struct({
	data: Schema.Struct({
		start: DateString,
		end: DateString,
		human_readable_total: Schema.String,
		languages: Schema.Array(WakaTimeLanguage),
	}),
});
export type WakaTimeStatsResponse = typeof WakaTimeStatsResponse.Type;

const decodeWakaTimeStats = Schema.decodeUnknownEffect(
	Schema.fromJsonString(WakaTimeStatsResponse),
);

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

class WakaTimeStatusError extends Data.TaggedError("WakaTimeStatusError")<{
	readonly status: number;
}> {}

class WakaTimeTransportError extends Data.TaggedError(
	"WakaTimeTransportError",
) {}

// 失敗時は null を返す（呼び出し側でキャッシュせずに空データを返す）
export function fetchWakaTimeActivity(
	accessToken: string,
): Promise<WakaTimeActivity | null> {
	const load = Effect.tryPromise({
		try: async (signal) => {
			const response = await fetch(WAKATIME_STATS_URL, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"User-Agent": "ojoxux.com (+https://ojoxux.com)",
				},
				signal,
			});

			if (!response.ok) {
				void response.body?.cancel().catch(() => {});
				throw new WakaTimeStatusError({ status: response.status });
			}

			return response.text();
		},
		catch: (error) =>
			error instanceof WakaTimeStatusError
				? error
				: new WakaTimeTransportError(),
	}).pipe(
		Effect.flatMap(decodeWakaTimeStats),
		Effect.map(toActivity),
		Effect.timeout("3 seconds"),
		Effect.retry({
			times: 1,
			schedule: Schedule.spaced("250 millis"),
			while: (error) =>
				error._tag === "TimeoutError" ||
				error._tag === "WakaTimeTransportError" ||
				(error._tag === "WakaTimeStatusError" &&
					(error.status === 408 || error.status >= 500)),
		}),
		Effect.catch((error) =>
			Effect.sync(() => {
				console.error("Failed to fetch WakaTime stats:", {
					reason: error._tag,
					...(error._tag === "WakaTimeStatusError" && { status: error.status }),
				});
				return null;
			}),
		),
	);

	return Effect.runPromise(load);
}
