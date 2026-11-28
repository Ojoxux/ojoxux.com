// API の型（Worker の worker/src/generated/api.ts と同じ形を Schema で持つ）
import { Schema } from "effect";
import type * as Generated from "../../../worker/src/generated/api.ts";

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

export class ApiError extends Schema.TaggedError<ApiError>()("ApiError", {
	endpoint: Schema.String,
}) {}

// Haskell の型から生成した TS 型と食い違ったらここで型エラーにする（Worker と FE で型を二重に持っているため）
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Mutable<T> =
	T extends ReadonlyArray<infer E>
		? Array<Mutable<E>>
		: { -readonly [K in keyof T]: Mutable<T[K]> };
export const _schemaMatchesGenerated: [
	Same<Mutable<WakaTimeActivity>, Generated.WakaTimeActivity>,
	Same<Mutable<BlogPost>, Generated.BlogPost>,
	Same<Mutable<VisitResult>, Generated.VisitResult>,
] = [true, true, true];
