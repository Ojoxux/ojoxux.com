import { Command, Component, UiSchema } from "@effect/ui";
import { Html, HtmlSubscription } from "@effect/ui/html";
import { Effect, Schema } from "effect";
import { Api } from "../../api/api.ts";
import { EyeIcon } from "../shared/icons.ts";
import { SectionHeading } from "../shared/section-heading.ts";
import {
	countDurationMs,
	countValueAt,
	formatWithSeparator,
} from "./count-up.ts";

export const VisitorMessage = UiSchema.TaggedEnum({
	SucceededPostVisit: { count: Schema.Number },
	FailedPostVisit: {},
	ClickedRetryVisit: {},
	TickedFrame: { delta: Schema.Number },
});

/** 訪問を 1 回数える。結果は Visitor の Message を返す */
export class PostVisit extends Command.Service<PostVisit>()(
	"ojoxux/PostVisit",
	{
		success: VisitorMessage,
	},
) {
	static readonly layer = this.toLayer(
		Effect.gen(function* () {
			const api = yield* Api;
			return () =>
				api.visit.pipe(
					Effect.match({
						onSuccess: ({ count }) =>
							VisitorMessage.SucceededPostVisit({ count }),
						onFailure: () => VisitorMessage.FailedPostVisit(),
					}),
				);
		}),
	);
}

const VisitorModel = Schema.Struct({
	visit: Schema.Literals(["Loading", "Loaded", "Failed"]),
	visitCount: Schema.Number,
	/** カウントアップの現在表示値 */
	countShown: Schema.Number,
	/** カウントアップ開始からの経過ミリ秒。null ならカウントしていない */
	countElapsed: Schema.NullOr(Schema.Number),
});
type VisitorModel = typeof VisitorModel.Type;

const VisitorCount = (
	h: Html.H<typeof VisitorMessage.Type>,
	model: VisitorModel,
) => {
	// 返すのはビルダーなので、呼び出し側の children は目のアイコンの後ろに足される
	const row = (...cls: ReadonlyArray<string>) =>
		h.div
			.class(...cls)
			.children(
				EyeIcon(h, "visitor-count__eye"),
				h.span.class("sr-only").children("Visits"),
			);
	switch (model.visit) {
		case "Loading":
			return row("visitor-count").children(
				h.span.class("visitor-count__status", "pulse").children("..."),
			);
		case "Loaded":
			return row("visitor-count", "visitor-count--ready").children(
				h.span
					.class("visitor-count__value")
					.children(formatWithSeparator(model.countShown)),
			);
		case "Failed":
			return row("visitor-count").children(
				h.span
					.class("visitor-count__error")
					.children(
						h.span("Error"),
						h.button
							.attr("type", "button")
							.class("visitor-count__retry")
							.on("click", VisitorMessage.ClickedRetryVisit())
							.children("Retry"),
					),
			);
	}
};

export const VisitorNoDeps = Html.component({
	name: "Visitor",
	props: Schema.Struct({ reducedMotion: Schema.Boolean }),
	model: VisitorModel,
	message: VisitorMessage,
}).make({
	init: ($) =>
		$.set({
			visit: "Loading",
			visitCount: 0,
			countShown: 0,
			countElapsed: null,
		}).run(PostVisit.make()),
	update: {
		SucceededPostVisit: ($, { count }) =>
			$.props.reducedMotion
				? $.evolve({
						visit: "Loaded",
						visitCount: count,
						countShown: count,
						countElapsed: null,
					})
				: $.evolve({
						visit: "Loaded",
						visitCount: count,
						countShown: 0,
						countElapsed: 0,
					}),
		FailedPostVisit: ($) => $.evolve({ visit: "Failed", countElapsed: null }),
		ClickedRetryVisit: ($) =>
			$.model.visit === "Failed"
				? $.evolve({ visit: "Loading" }).run(PostVisit.make())
				: $.model,
		TickedFrame: ($, { delta }) => {
			if ($.model.countElapsed === null) return $.model;
			const elapsed = $.model.countElapsed + delta;
			return $.evolve({
				countShown: countValueAt($.model.visitCount, elapsed),
				countElapsed: elapsed >= countDurationMs ? null : elapsed,
			});
		},
	},
	subscriptions: ({ model }) => [
		model.countElapsed !== null &&
			HtmlSubscription.onAnimationFrame((delta) =>
				VisitorMessage.TickedFrame({ delta }),
			),
	],
	view: (h, model) =>
		h.div
			.class("visitor")
			.children(SectionHeading(h, "Visitor"), VisitorCount(h, model)),
});

export const Visitor = VisitorNoDeps.pipe(Component.provide(PostVisit.layer));
