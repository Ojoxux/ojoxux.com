import { Component } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { AsyncResult } from "effect/reactivity";
import type { WakaTimeLanguage } from "../../../../shared/api-schema.ts";
import { Panel } from "../shared/panel.ts";
import { SectionHeading } from "../shared/section-heading.ts";
import { SkeletonBox } from "../shared/skeleton-box.ts";
import { filledBlocks, rowBlocks } from "./activity-blocks.ts";
import { GetWakaTime } from "./get-waka-time.ts";

const WakaTimeSkeleton = <M>(h: Html.H<M>) =>
	h.div
		.class("skeleton-waka", "pulse")
		.children(
			h.div
				.class("skeleton-heading")
				.children(
					SkeletonBox(h, "skeleton-waka__label"),
					SkeletonBox(h, "skeleton-waka__total"),
				),
			SkeletonBox(h, "skeleton-waka__bar"),
		);

const LanguageRow = <M>(h: Html.H<M>, language: WakaTimeLanguage) => {
	const filled = filledBlocks(language.percent);
	return h.li
		.class("activity__row")
		.children(
			h.span.class("activity__language").children(language.name),
			h.div
				.class("activity__metrics")
				.children(
					h.div
						.class("activity__blocks")
						.children(
							...Array.from({ length: rowBlocks }, (_, i) =>
								h.div.class(
									"activity__block",
									i < filled
										? "activity__block--filled"
										: "activity__block--empty",
								),
							),
						),
					h.span.class("activity__duration").children(language.text),
				),
		);
};

const WakaTimeNoDeps = Html.component({
	name: "WakaTime",
	model: Schema.Null,
	message: Schema.Never,
	queries: { wakaTime: { query: GetWakaTime, args: () => ({}) } },
}).make({
	init: () => null,
	update: ($) => $.model,
	view: (h) =>
		Panel(h, false).children(
			AsyncResult.match(h.queries.wakaTime, {
				onInitial: () => WakaTimeSkeleton(h),
				onFailure: () => null,
				onSuccess: ({ value: activity }) =>
					activity.languages.length === 0
						? null
						: h.div
								.class("activity")
								.children(
									h.div
										.class("activity__heading")
										.children(
											SectionHeading(h, "Activity"),
											h.p
												.class("activity__total")
												.children(
													h.span(activity.totalText),
													activity.rangeText !== "" &&
														h.span
															.class("activity__range")
															.children(activity.rangeText),
												),
										),
									h.ul
										.class("activity__list")
										.children(
											...activity.languages.map((l) => LanguageRow(h, l)),
										),
								),
			}),
		),
});

export const WakaTime = WakaTimeNoDeps.pipe(
	Component.provide(GetWakaTime.layer),
);
