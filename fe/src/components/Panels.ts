// WakaTime・Posts・読み込み中のスケルトン（旧 Ojoxux.View.{WakaTime,Posts,Skeleton}）
import type { Html } from "@effect/ui/html";
import { AsyncResult } from "effect/reactivity";
import { filledBlocks, rowBlocks } from "../core/basics.ts";
import type {
	ApiError,
	BlogPost,
	WakaTimeActivity,
	WakaTimeLanguage,
} from "../domain/Api.ts";
import { SectionHeading } from "./Common.ts";

const Box = <M>(h: Html.H<M>, cls: string) => h.div.class("skeleton-box", cls);

export const WakaTimeSkeleton = <M>(h: Html.H<M>) =>
	h.div
		.class("skeleton-waka", "pulse")
		.children(
			h.div
				.class("skeleton-heading")
				.children(
					Box(h, "skeleton-waka__label"),
					Box(h, "skeleton-waka__total"),
				),
			Box(h, "skeleton-waka__bar"),
		);

export const PostsSkeleton = <M>(h: Html.H<M>) =>
	h.div
		.class("skeleton-posts", "pulse")
		.children(
			Box(h, "skeleton-posts__label"),
			h.div
				.class("skeleton-posts__list")
				.children(
					...Array.from({ length: 3 }, () =>
						h.div
							.class("skeleton-posts__post")
							.children(
								Box(h, "skeleton-posts__image"),
								Box(h, "skeleton-posts__title"),
								Box(h, "skeleton-posts__date"),
							),
					),
				),
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

/** 失敗と空は何も描かない（Miso 版の emptyView） */
export const WakaTimePanel = <M>(
	h: Html.H<M>,
	result: AsyncResult.AsyncResult<WakaTimeActivity, ApiError>,
) =>
	AsyncResult.match(result, {
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
								.children(...activity.languages.map((l) => LanguageRow(h, l))),
						),
	});

const PostItem = <M>(h: Html.H<M>, post: BlogPost) =>
	h.li(
		h.a
			.attrs({ href: post.link, target: "_blank", rel: "noopener noreferrer" })
			.class("posts__link")
			.children(
				post.thumbnail !== undefined
					? h.img
							.attrs({ src: post.thumbnail, alt: "", loading: "lazy" })
							.class("posts__thumbnail")
					: h.div.class("posts__thumbnail-placeholder"),
				h.div
					.class("posts__meta")
					.children(
						h.span.class("posts__title").children(post.title),
						h.span.class("posts__date").children(post.pubDate),
					),
			),
	);

export const PostsPanel = <M>(
	h: Html.H<M>,
	result: AsyncResult.AsyncResult<ReadonlyArray<BlogPost>, ApiError>,
) =>
	AsyncResult.match(result, {
		onInitial: () => PostsSkeleton(h),
		onFailure: () => null,
		onSuccess: ({ value: posts }) =>
			posts.length === 0
				? null
				: h.div
						.class("posts")
						.children(
							SectionHeading(h, "Posts"),
							h.ul
								.class("posts__list")
								.children(...posts.map((p) => PostItem(h, p))),
						),
	});
