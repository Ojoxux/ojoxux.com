import { Story } from "@effect/ui/testing";
import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { PostVisit, VisitorMessage, VisitorNoDeps } from "./visitor.ts";

const props = { reducedMotion: false };

describe("Visitor", () => {
	it.effect("起動時に訪問を数え、結果をカウントアップで表示する", () =>
		Effect.gen(function* () {
			const s = yield* Story.make(VisitorNoDeps, props);
			s.expectExact(PostVisit);
			assert.strictEqual(s.model.visit, "Loading");

			s.resolve(PostVisit, VisitorMessage.SucceededPostVisit({ count: 1000 }));
			assert.strictEqual(s.model.visit, "Loaded");
			assert.strictEqual(s.model.countShown, 0);
			assert.strictEqual(s.subscriptions.length, 1);

			s.send(VisitorMessage.TickedFrame({ delta: 500 }));
			assert.strictEqual(s.model.countShown, 875);

			s.send(VisitorMessage.TickedFrame({ delta: 500 }));
			assert.strictEqual(s.model.countShown, 1000);
			// 所要時間を過ぎたらフレームの購読をやめる
			assert.strictEqual(s.model.countElapsed, null);
			assert.strictEqual(s.subscriptions.length, 0);
		}),
	);

	it.effect("reduced motion ならカウントアップせずに目標値を出す", () =>
		Effect.gen(function* () {
			const s = yield* Story.make(VisitorNoDeps, {
				...props,
				reducedMotion: true,
			});
			s.expectExact(PostVisit).resolve(
				PostVisit,
				VisitorMessage.SucceededPostVisit({ count: 42 }),
			);
			assert.strictEqual(s.model.countShown, 42);
			assert.strictEqual(s.subscriptions.length, 0);
		}),
	);

	it.effect("失敗したら Retry で数え直す。連打しても 1 回だけ", () =>
		Effect.gen(function* () {
			const s = yield* Story.make(VisitorNoDeps, props);
			s.expectExact(PostVisit).resolve(
				PostVisit,
				VisitorMessage.FailedPostVisit(),
			);
			assert.strictEqual(s.model.visit, "Failed");

			s.send(VisitorMessage.ClickedRetryVisit())
				.expectExact(PostVisit)
				.keepPending(PostVisit);
			assert.strictEqual(s.model.visit, "Loading");
			// 2 回目のクリックは Loading 中なので何も走らせない
			s.send(VisitorMessage.ClickedRetryVisit());
			assert.strictEqual(s.pending.length, 1);
			s.resolve(PostVisit, VisitorMessage.SucceededPostVisit({ count: 3 }));
			assert.strictEqual(s.model.visit, "Loaded");
		}),
	);
});
