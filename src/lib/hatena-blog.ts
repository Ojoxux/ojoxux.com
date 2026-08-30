export type BlogPost = {
	title: string;
	link: string;
	pubDate: string;
	thumbnail?: string;
};

const HATENA_BLOG_RSS_URL = "https://ojoxux.hatenablog.com/rss";

const ITEM_REGEX = /<item>([\s\S]*?)<\/item>/g;
const TITLE_REGEX = /<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([\s\S]*?))<\/title>/;
const LINK_REGEX = /<link>([\s\S]*?)<\/link>/;
const PUB_DATE_REGEX = /<pubDate>([\s\S]*?)<\/pubDate>/;
const META_TAG_REGEX = /<meta\s+[^>]*>/gi;
const OG_IMAGE_PROPERTY_REGEX = /property=["']og:image["']/i;
const META_CONTENT_REGEX = /content=["']([^"']+)["']/i;

function extractOgImage(html: string): string | undefined {
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

async function fetchOgImage(url: string): Promise<string | undefined> {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			return undefined;
		}

		return extractOgImage(await response.text());
	} catch (error) {
		console.error(`Failed to fetch OGP image for ${url}:`, error);
		return undefined;
	}
}

function formatDate(rawDate: string): string {
	const date = new Date(rawDate);

	if (Number.isNaN(date.getTime())) {
		return rawDate;
	}

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

export async function getLatestBlogPosts(limit: number): Promise<BlogPost[]> {
	try {
		const response = await fetch(HATENA_BLOG_RSS_URL);

		if (!response.ok) {
			throw new Error(`Hatena Blog RSS responded with ${response.status}`);
		}

		const xml = await response.text();
		const basePosts: Omit<BlogPost, "thumbnail">[] = [];

		for (const match of xml.matchAll(ITEM_REGEX)) {
			const itemXml = match[1];
			const titleMatch = itemXml.match(TITLE_REGEX);
			const linkMatch = itemXml.match(LINK_REGEX);
			const pubDateMatch = itemXml.match(PUB_DATE_REGEX);

			if (!titleMatch || !linkMatch || !pubDateMatch) {
				continue;
			}

			basePosts.push({
				title: (titleMatch[1] ?? titleMatch[2] ?? "").trim(),
				link: linkMatch[1].trim(),
				pubDate: formatDate(pubDateMatch[1].trim()),
			});

			if (basePosts.length >= limit) {
				break;
			}
		}

		return await Promise.all(
			basePosts.map(async (post) => ({
				...post,
				thumbnail: await fetchOgImage(post.link),
			})),
		);
	} catch (error) {
		console.error("Failed to fetch Hatena Blog RSS:", error);
		return [];
	}
}
