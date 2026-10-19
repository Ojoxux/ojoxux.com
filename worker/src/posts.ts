import { withCache } from "./cache";
import type { BlogPost } from "./generated/api";

export type BasePost = Omit<BlogPost, "thumbnail">;

const HATENA_BLOG_RSS_URL = "https://ojoxux.hatenablog.com/rss";
const OGP_TTL_SECONDS = 86400;

const ITEM_REGEX = /<item>([\s\S]*?)<\/item>/g;
const TITLE_REGEX = /<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/;
const LINK_REGEX = /<link>([\s\S]*?)<\/link>/;
const PUB_DATE_REGEX = /<pubDate>([\s\S]*?)<\/pubDate>/;
const META_TAG_REGEX = /<meta\s+[^>]*>/gi;
const OG_IMAGE_PROPERTY_REGEX = /property=["']og:image["']/i;
const META_CONTENT_REGEX = /content=["']([^"']+)["']/i;

export function extractOgImage(html: string): string | undefined {
	for (const match of html.matchAll(META_TAG_REGEX)) {
		const tag = match[0];

		if (!OG_IMAGE_PROPERTY_REGEX.test(tag)) {
			continue;
		}

		const contentMatch = tag.match(META_CONTENT_REGEX);

		if (contentMatch) {
			return contentMatch[1];
		}
	}

	return undefined;
}

// Workers は UTC で動くので、日付は日本時間で整形する（en-CA は YYYY-MM-DD 形式）
const PUB_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Asia/Tokyo",
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

export function formatPubDate(rawDate: string): string {
	const date = new Date(rawDate);

	if (Number.isNaN(date.getTime())) {
		return rawDate;
	}

	return PUB_DATE_FORMATTER.format(date);
}

export function parseRss(xml: string, limit: number): BasePost[] {
	const posts: BasePost[] = [];

	for (const match of xml.matchAll(ITEM_REGEX)) {
		const itemXml = match[1] ?? "";
		const titleMatch = itemXml.match(TITLE_REGEX);
		const linkMatch = itemXml.match(LINK_REGEX);
		const pubDateMatch = itemXml.match(PUB_DATE_REGEX);

		if (!titleMatch || !linkMatch || !pubDateMatch) {
			continue;
		}

		posts.push({
			title: (titleMatch[1] ?? titleMatch[2] ?? "").trim(),
			link: (linkMatch[1] ?? "").trim(),
			pubDate: formatPubDate((pubDateMatch[1] ?? "").trim()),
		});

		if (posts.length >= limit) {
			break;
		}
	}

	return posts;
}

async function fetchOgImage(url: string): Promise<string | null> {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			return null;
		}

		return extractOgImage(await response.text()) ?? null;
	} catch (error) {
		console.error(`Failed to fetch OGP image for ${url}:`, error);
		return null;
	}
}

// 失敗時は null を返す（呼び出し側でキャッシュせずに空配列を返す）
export async function fetchLatestPosts(
	limit: number,
): Promise<BlogPost[] | null> {
	try {
		const response = await fetch(HATENA_BLOG_RSS_URL);

		if (!response.ok) {
			throw new Error(`Hatena Blog RSS responded with ${response.status}`);
		}

		const basePosts = parseRss(await response.text(), limit);

		return await Promise.all(
			basePosts.map(async (post) => {
				const thumbnail = await withCache(
					`ogp:${post.link}`,
					OGP_TTL_SECONDS,
					() => fetchOgImage(post.link),
				);

				return thumbnail === null ? post : { ...post, thumbnail };
			}),
		);
	} catch (error) {
		console.error("Failed to fetch Hatena Blog RSS:", error);
		return null;
	}
}
