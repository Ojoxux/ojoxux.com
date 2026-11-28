// /api/* への I/O はすべてこのサービスを通す。Query と Command がこれを掴むので、コンポーネントからは見えない
import { Context, Effect, Layer, Schema } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import {
	ApiError,
	BlogPost,
	VisitResult,
	WakaTimeActivity,
} from "./api-schema.ts";

/** Worker 側の MAX_POST_LIMIT (10) を超えると 5 件に戻されるので、それ以下にする */
const postLimit = 10;

export class Api extends Context.Service<
	Api,
	{
		readonly wakaTime: Effect.Effect<WakaTimeActivity, ApiError>;
		readonly posts: Effect.Effect<ReadonlyArray<BlogPost>, ApiError>;
		readonly visit: Effect.Effect<VisitResult, ApiError>;
	}
>()("ojoxux/Api") {
	static readonly layerHttp = Layer.effect(
		Api,
		Effect.gen(function* () {
			const client = (yield* HttpClient.HttpClient).pipe(
				HttpClient.filterStatusOk,
			);
			// エラーレスポンスの中身は使わない（Miso 版もログ以上のことはしていない）
			const failAs = (endpoint: string) =>
				Effect.mapError(() => new ApiError({ endpoint }));

			return Api.of({
				wakaTime: client
					.get("/api/wakatime")
					.pipe(
						Effect.flatMap(HttpClientResponse.schemaBodyJson(WakaTimeActivity)),
						failAs("wakatime"),
					),
				posts: client
					.get("/api/posts", { urlParams: { limit: postLimit } })
					.pipe(
						Effect.flatMap(
							HttpClientResponse.schemaBodyJson(Schema.Array(BlogPost)),
						),
						failAs("posts"),
					),
				visit: client
					.post("/api/visit")
					.pipe(
						Effect.flatMap(HttpClientResponse.schemaBodyJson(VisitResult)),
						failAs("visit"),
					),
			});
		}),
	);
}
