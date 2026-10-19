import { describe, expect, it } from "vitest";
import { extractOgImage, formatPubDate, parseRss } from "../src/posts";

const RSS = `<?xml version="1.0"?>
<rss><channel><title>blog</title>
<item><title><![CDATA[Haskell & Miso]]></title><link>https://ojoxux.hatenablog.com/entry/a</link><pubDate>Sat, 18 Oct 2026 12:00:00 +0900</pubDate></item>
<item><title>Plain title</title><link> https://ojoxux.hatenablog.com/entry/b </link><pubDate>Fri, 17 Oct 2026 12:00:00 +0900</pubDate></item>
<item><title>No date</title><link>https://ojoxux.hatenablog.com/entry/c</link></item>
<item><title>Third</title><link>https://ojoxux.hatenablog.com/entry/d</link><pubDate>Thu, 16 Oct 2026 12:00:00 +0900</pubDate></item>
</channel></rss>`;

describe("parseRss", () => {
	it("item を順に取り出し、pubDate の無い item は飛ばす", () => {
		expect(parseRss(RSS, 5)).toEqual([
			{
				title: "Haskell & Miso",
				link: "https://ojoxux.hatenablog.com/entry/a",
				pubDate: "2026-10-18",
			},
			{
				title: "Plain title",
				link: "https://ojoxux.hatenablog.com/entry/b",
				pubDate: "2026-10-17",
			},
			{
				title: "Third",
				link: "https://ojoxux.hatenablog.com/entry/d",
				pubDate: "2026-10-16",
			},
		]);
	});

	it("limit 件で打ち切る", () => {
		expect(parseRss(RSS, 2)).toHaveLength(2);
	});
});

describe("formatPubDate", () => {
	it("解釈できない日付はそのまま返す", () => {
		expect(formatPubDate("not a date")).toBe("not a date");
	});

	it("日本時間の早朝に公開した記事も当日の日付になる", () => {
		expect(formatPubDate("Sat, 18 Oct 2026 08:00:00 +0900")).toBe("2026-10-18");
	});
});

describe("extractOgImage", () => {
	it("og:image の content を返す", () => {
		expect(
			extractOgImage(
				'<head><meta property="og:image" content="https://cdn.example/x.png"></head>',
			),
		).toBe("https://cdn.example/x.png");
	});

	it("属性の順序が逆でも取り出せる", () => {
		expect(
			extractOgImage(
				"<meta content='https://cdn.example/y.png' property='og:image' />",
			),
		).toBe("https://cdn.example/y.png");
	});

	it("og:image が無ければ undefined", () => {
		expect(
			extractOgImage('<meta property="og:title" content="t">'),
		).toBeUndefined();
	});
});
