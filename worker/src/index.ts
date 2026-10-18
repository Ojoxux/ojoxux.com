import { Hono } from "hono";
import { withCache } from "./cache";
import type { BlogPost, VisitResult, WakaTimeActivity } from "./generated/api";
import { fetchLatestPosts } from "./posts";
import { incrementVisitorCount } from "./visit";
import { EMPTY_ACTIVITY, fetchWakaTimeActivity } from "./wakatime";

type Bindings = {
	DB: D1Database;
	ASSETS: Fetcher;
	WAKATIME_API_KEY?: string;
};

const WAKATIME_TTL_SECONDS = 3600;
const POSTS_TTL_SECONDS = 1800;
const DEFAULT_POST_LIMIT = 5;
const MAX_POST_LIMIT = 10;

function parsePostLimit(raw: string | undefined): number {
	const limit = Number(raw ?? DEFAULT_POST_LIMIT);

	return Number.isInteger(limit) && limit >= 1 && limit <= MAX_POST_LIMIT
		? limit
		: DEFAULT_POST_LIMIT;
}

const app = new Hono<{ Bindings: Bindings }>();

app.get("/api/wakatime", async (c) => {
	const apiKey = c.env.WAKATIME_API_KEY;

	if (!apiKey) {
		console.error("Missing required Cloudflare secret: WAKATIME_API_KEY");
		return c.json<WakaTimeActivity>(EMPTY_ACTIVITY);
	}

	const activity = await withCache("wakatime", WAKATIME_TTL_SECONDS, () =>
		fetchWakaTimeActivity(apiKey),
	);

	return c.json<WakaTimeActivity>(activity ?? EMPTY_ACTIVITY);
});

app.get("/api/posts", async (c) => {
	const limit = parsePostLimit(c.req.query("limit"));
	const posts = await withCache(`posts:${limit}`, POSTS_TTL_SECONDS, () =>
		fetchLatestPosts(limit),
	);

	return c.json<BlogPost[]>(posts ?? []);
});

app.post("/api/visit", async (c) => {
	try {
		const count = await incrementVisitorCount(c.env.DB);
		return c.json<VisitResult>({ count });
	} catch (error) {
		console.error("Error incrementing visitor count:", error);
		return c.json({ error: "Failed to increment visitor count" }, 500);
	}
});

// run_worker_first は /api/* だけなので通常ここには来ないが、念のため静的アセットに流す
app.notFound((c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
