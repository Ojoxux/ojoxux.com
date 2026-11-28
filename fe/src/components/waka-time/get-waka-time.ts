import { Query } from "@effect/ui";
import { Effect } from "effect";
import { Api } from "../../api/api.ts";
import { ApiError, WakaTimeActivity } from "../../api/api-schema.ts";

export class GetWakaTime extends Query.Service<GetWakaTime>()(
	"ojoxux/GetWakaTime",
	{
		success: WakaTimeActivity,
		error: ApiError,
		// Worker 側でもキャッシュしているので、1 回の閲覧中は取り直さない
		staleTime: "Infinity",
	},
) {
	static readonly layer = this.toLayer(
		Effect.gen(function* () {
			const api = yield* Api;
			return () => api.wakaTime;
		}),
	);
}
