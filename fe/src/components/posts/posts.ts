import { Component } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { AsyncResult } from "effect/reactivity";
import type { BlogPost } from "../../api/api-schema.ts";
import { Panel } from "../shared/panel.ts";
import { SectionHeading } from "../shared/section-heading.ts";
import { SkeletonBox } from "../shared/skeleton-box.ts";
import { ListPosts } from "./list-posts.ts";

const PostsSkeleton = <M>(h: Html.H<M>) =>
	h.div
		.class("skeleton-posts", "pulse")
		.children(
			SkeletonBox(h, "skeleton-posts__label"),
			h.div
				.class("skeleton-posts__list")
				.children(
					...Array.from({ length: 3 }, () =>
						h.div
							.class("skeleton-posts__post")
							.children(
								SkeletonBox(h, "skeleton-posts__image"),
								SkeletonBox(h, "skeleton-posts__title"),
								SkeletonBox(h, "skeleton-posts__date"),
							),
					),
				),
		);

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

const PostsNoDeps = Html.component({
	name: "Posts",
	model: Schema.Null,
	message: Schema.Never,
	queries: { posts: { query: ListPosts, args: () => ({}) } },
}).make({
	init: () => null,
	update: ($) => $.model,
	view: (h) =>
		Panel(h, true).children(
			AsyncResult.match(h.queries.posts, {
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
			}),
		),
});

export const Posts = PostsNoDeps.pipe(Component.provide(ListPosts.layer));
