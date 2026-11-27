import { Query } from "@effect/ui";
import { Effect, Schema } from "effect";
import { ApiError, BlogPost } from "../domain/Api.ts";
import { Api } from "../services/Api.ts";

export class ListPosts extends Query.Service<ListPosts>()("ojoxux/ListPosts", {
	success: Schema.Array(BlogPost),
	error: ApiError,
	// Worker 側でもキャッシュしているので、1 回の閲覧中は取り直さない
	staleTime: "Infinity",
}) {
	static readonly layer = this.toLayer(
		Effect.gen(function* () {
			const api = yield* Api;
			return () => api.posts;
		}),
	);
}
