import { Schema } from "effect";
import { describe, expect, it } from "vitest";
import { BlogPost, VisitResult, WakaTimeActivity } from "./api-schema.ts";

describe("WakaTimeActivity", () => {
	const json = Schema.fromJsonString(WakaTimeActivity);

	it("Worker が返す JSON をデコードできる", () => {
		expect(
			Schema.decodeUnknownSync(json)(
				'{"rangeText":"10/12 – 10/18","totalText":"12 hrs 3 mins","languages":[{"name":"Haskell","text":"5 hrs","percent":41.5}]}',
			),
		).toEqual({
			rangeText: "10/12 – 10/18",
			totalText: "12 hrs 3 mins",
			languages: [{ name: "Haskell", text: "5 hrs", percent: 41.5 }],
		});
	});

	it("往復しても値が変わらない", () => {
		const activity = {
			rangeText: "a",
			totalText: "b",
			languages: [{ name: "Nix", text: "1 hr", percent: 10 }],
		};
		expect(
			Schema.decodeUnknownSync(json)(Schema.encodeSync(json)(activity)),
		).toEqual(activity);
	});
});

describe("BlogPost", () => {
	const json = Schema.fromJsonString(BlogPost);
	const post = {
		title: "t",
		link: "https://example.com",
		pubDate: "2026-10-18",
	};
	const thumbnail = "https://cdn.example.com/x.png";

	it("thumbnail がない JSON をデコードできる", () => {
		expect(
			Schema.decodeUnknownSync(json)(
				'{"title":"t","link":"https://example.com","pubDate":"2026-10-18"}',
			),
		).toEqual(post);
	});

	it("thumbnail がある JSON をデコードできる", () => {
		expect(
			Schema.decodeUnknownSync(json)(
				'{"title":"t","link":"https://example.com","pubDate":"2026-10-18","thumbnail":"https://cdn.example.com/x.png"}',
			),
		).toEqual({ ...post, thumbnail });
	});

	it("thumbnail がなければエンコード時にキーを省略する", () => {
		expect(JSON.parse(Schema.encodeSync(json)(post))).toStrictEqual(post);
	});
});

describe("VisitResult", () => {
	const json = Schema.fromJsonString(VisitResult);

	it("Worker が返す JSON をデコードできる", () => {
		expect(Schema.decodeUnknownSync(json)('{"count":12345}')).toEqual({
			count: 12345,
		});
	});

	it('{"count": n} としてエンコードする', () => {
		expect(Schema.encodeSync(json)({ count: 1 })).toBe('{"count":1}');
	});
});
