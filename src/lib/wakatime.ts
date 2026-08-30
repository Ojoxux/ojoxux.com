import { getCloudflareContext } from "@opennextjs/cloudflare";

type CloudflareEnvWithWakaTime = CloudflareEnv & {
	WAKATIME_API_KEY?: string;
};

export type WakaTimeLanguage = {
	name: string;
	text: string;
	percent: number;
};

export type WakaTimeActivity = {
	rangeText: string;
	totalText: string;
	languages: WakaTimeLanguage[];
};

type WakaTimeStatsResponse = {
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

const EMPTY_ACTIVITY: WakaTimeActivity = {
	rangeText: "",
	totalText: "",
	languages: [],
};

const WAKATIME_STATS_URL =
	"https://wakatime.com/api/v1/users/current/stats/last_7_days";
const MAX_LANGUAGES = 6;

const DATE_RANGE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
	timeZone: "Asia/Tokyo",
	month: "numeric",
	day: "numeric",
});

function formatDateRange(startIso: string, endIso: string): string {
	const start = DATE_RANGE_FORMATTER.format(new Date(startIso));
	const end = DATE_RANGE_FORMATTER.format(new Date(endIso));

	return `${start} – ${end}`;
}

export async function getWakaTimeActivity(): Promise<WakaTimeActivity> {
	const { env } = await getCloudflareContext({ async: true });
	const apiKey = (env as CloudflareEnvWithWakaTime).WAKATIME_API_KEY;

	if (!apiKey) {
		console.error("Missing required Cloudflare secret: WAKATIME_API_KEY");
		return EMPTY_ACTIVITY;
	}

	try {
		const response = await fetch(WAKATIME_STATS_URL, {
			headers: {
				Authorization: `Basic ${btoa(apiKey)}`,
			},
		});

		if (!response.ok) {
			throw new Error(`WakaTime API responded with ${response.status}`);
		}

		const json = (await response.json()) as WakaTimeStatsResponse;

		return {
			rangeText: formatDateRange(json.data.start, json.data.end),
			totalText: json.data.human_readable_total,
			languages: json.data.languages
				.filter((language) => language.percent > 0)
				.slice(0, MAX_LANGUAGES)
				.map((language) => ({
					name: language.name,
					text: language.text,
					percent: language.percent,
				})),
		};
	} catch (error) {
		console.error("Failed to fetch WakaTime stats:", error);
		return EMPTY_ACTIVITY;
	}
}
