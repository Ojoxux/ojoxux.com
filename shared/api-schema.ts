import { Schema } from "effect";

export const WakaTimeLanguage = Schema.Struct({
	name: Schema.String,
	text: Schema.String,
	percent: Schema.Number,
});
export type WakaTimeLanguage = typeof WakaTimeLanguage.Type;

export const WakaTimeActivity = Schema.Struct({
	rangeText: Schema.String,
	totalText: Schema.String,
	languages: Schema.Array(WakaTimeLanguage),
});
export type WakaTimeActivity = typeof WakaTimeActivity.Type;

export const BlogPost = Schema.Struct({
	title: Schema.String,
	link: Schema.String,
	pubDate: Schema.String,
	thumbnail: Schema.optionalKey(Schema.String),
});
export type BlogPost = typeof BlogPost.Type;

export const VisitResult = Schema.Struct({ count: Schema.Number });
export type VisitResult = typeof VisitResult.Type;
