import { Story } from "@effect/ui/testing";
import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { AppMessage, AppNoDeps, PostVisit } from "../src/App.ts";

const props = { birthday: false, reducedMotion: false };

describe("App", () => {
	it.effect("起動時に訪問を数え、結果をカウントアップで表示する", () =>
		Effect.gen(function* () {
			const s = yield* Story.make(AppNoDeps, props);
			// WakaTime と Posts の取得はここでは見ない
			s.keepPending("wakaTime").keepPending("posts");
			s.expectExact(PostVisit);
			assert.strictEqual(s.model.visit, "Loading");

			s.resolve(PostVisit, AppMessage.SucceededPostVisit({ count: 1000 }));
			assert.strictEqual(s.model.visit, "Loaded");
			assert.strictEqual(s.model.countShown, 0);
			assert.strictEqual(s.subscriptions.length, 1);

			s.send(AppMessage.TickedFrame({ delta: 500 }));
			assert.strictEqual(s.model.countShown, 875);

			s.send(AppMessage.TickedFrame({ delta: 500 }));
			assert.strictEqual(s.model.countShown, 1000);
			// 所要時間を過ぎたらフレームの購読をやめる
			assert.strictEqual(s.model.countElapsed, null);
			assert.strictEqual(s.subscriptions.length, 0);
		}),
	);

	it.effect("reduced motion ならカウントアップせずに目標値を出す", () =>
		Effect.gen(function* () {
			const s = yield* Story.make(AppNoDeps, { ...props, reducedMotion: true });
			// WakaTime と Posts の取得はここでは見ない
			s.keepPending("wakaTime").keepPending("posts");
			s.expectExact(PostVisit).resolve(
				PostVisit,
				AppMessage.SucceededPostVisit({ count: 42 }),
			);
			assert.strictEqual(s.model.countShown, 42);
			assert.strictEqual(s.subscriptions.length, 0);
		}),
	);

	it.effect("失敗したら Retry で数え直す。連打しても 1 回だけ", () =>
		Effect.gen(function* () {
			const s = yield* Story.make(AppNoDeps, props);
			// WakaTime と Posts の取得はここでは見ない
			s.keepPending("wakaTime").keepPending("posts");
			s.expectExact(PostVisit).resolve(PostVisit, AppMessage.FailedPostVisit());
			assert.strictEqual(s.model.visit, "Failed");

			s.send(AppMessage.ClickedRetryVisit())
				.expectExact(PostVisit)
				.keepPending(PostVisit);
			assert.strictEqual(s.model.visit, "Loading");
			// 2 回目のクリックは Loading 中なので何も走らせない
			s.send(AppMessage.ClickedRetryVisit());
			assert.strictEqual(s.pending.length, 1);
			s.resolve(PostVisit, AppMessage.SucceededPostVisit({ count: 3 }));
			assert.strictEqual(s.model.visit, "Loaded");
		}),
	);

	it.effect("花火のトグル", () =>
		Effect.gen(function* () {
			const s = yield* Story.make(AppNoDeps, { ...props, birthday: true });
			// WakaTime と Posts の取得はここでは見ない
			s.keepPending("wakaTime").keepPending("posts");
			s.expectExact(PostVisit).resolve(
				PostVisit,
				AppMessage.SucceededPostVisit({ count: 1 }),
			);
			assert.isTrue(s.model.fireworks);
			s.send(AppMessage.ClickedFireworksToggle());
			assert.isFalse(s.model.fireworks);
		}),
	);
});
