/**
 * ルートコンポーネント（旧 Ojoxux.{Model,Update,View} と View.{Profile,Visitor}）。
 * WakaTime と Posts は Query で取り、結果は Model の外（h.queries）にある。
 * 訪問数のカウントアップは requestAnimationFrame の Subscription で進める
 */
import { Command, Component, UiSchema } from "@effect/ui";
import { Html, HtmlSubscription } from "@effect/ui/html";
import { Effect, Layer, Schema } from "effect";
import {
	EyeIcon,
	GithubIcon,
	PartyPopperIcon,
	SectionHeading,
	WaveDivider,
	XIcon,
	ZennIcon,
} from "./components/Common.ts";
import { PostsPanel, WakaTimePanel } from "./components/Panels.ts";
import {
	countDurationMs,
	countValueAt,
	formatWithSeparator,
} from "./core/basics.ts";
import { RunFireworks } from "./mounts/Fireworks.ts";
import { LoadHatenaStar } from "./mounts/HatenaStar.ts";
import { GetWakaTime } from "./queries/GetWakaTime.ts";
import { ListPosts } from "./queries/ListPosts.ts";
import { Api } from "./services/Api.ts";

export const AppMessage = UiSchema.TaggedEnum({
	SucceededPostVisit: { count: Schema.Number },
	FailedPostVisit: {},
	ClickedRetryVisit: {},
	ClickedFireworksToggle: {},
	TickedFrame: { delta: Schema.Number },
});

/** 訪問を 1 回数える。結果は App だけが使うので App の Message を返す */
export class PostVisit extends Command.Service<PostVisit>()(
	"ojoxux/PostVisit",
	{
		success: AppMessage,
	},
) {
	static readonly layer = this.toLayer(
		Effect.gen(function* () {
			const api = yield* Api;
			return () =>
				api.visit.pipe(
					Effect.match({
						onSuccess: ({ count }) => AppMessage.SucceededPostVisit({ count }),
						onFailure: () => AppMessage.FailedPostVisit(),
					}),
				);
		}),
	);
}

const AppModel = Schema.Struct({
	visit: Schema.Literals(["Loading", "Loaded", "Failed"]),
	visitCount: Schema.Number,
	/** カウントアップの現在表示値 */
	countShown: Schema.Number,
	/** カウントアップ開始からの経過ミリ秒。null ならカウントしていない */
	countElapsed: Schema.NullOr(Schema.Number),
	/** 花火のトグル。誕生日モードのときだけ意味を持つ */
	fireworks: Schema.Boolean,
});
type AppModel = typeof AppModel.Type;

const AppDef = Html.component({
	name: "App",
	props: Schema.Struct({
		/** 起動時に一度だけ判定する */
		birthday: Schema.Boolean,
		reducedMotion: Schema.Boolean,
	}),
	model: AppModel,
	message: AppMessage,
	queries: {
		wakaTime: { query: GetWakaTime, args: () => ({}) },
		posts: { query: ListPosts, args: () => ({}) },
	},
});

type H = Html.H<typeof AppMessage.Type>;

type SocialIcon = "github" | "x" | "hatena" | "zenn";

const socialLinks: ReadonlyArray<{
	readonly label: string;
	readonly account: string;
	readonly href: string;
	readonly icon: SocialIcon;
}> = [
	{
		label: "GitHub",
		account: "Ojoxux",
		href: "https://github.com/Ojoxux",
		icon: "github",
	},
	{
		label: "X",
		account: "Ojoxux__18",
		href: "https://x.com/ojoxux__18",
		icon: "x",
	},
	{
		label: "はてなブログ",
		account: "でってまんず、もっけだの",
		href: "https://ojoxux.hatenablog.com",
		icon: "hatena",
	},
	{
		label: "Zenn",
		account: "Ojoxux",
		href: "https://zenn.dev/ojoxux",
		icon: "zenn",
	},
];

const SocialIconView = (h: H, icon: SocialIcon) => {
	switch (icon) {
		case "github":
			return GithubIcon(h, "social-links__icon");
		case "x":
			return XIcon(h, "social-links__icon");
		case "zenn":
			return ZennIcon(h, "social-links__icon");
		case "hatena":
			return h.img
				.attrs({ src: "/hatena-blog.png", alt: "", width: "28", height: "28" })
				.class("social-links__image");
	}
};

/** hover で表裏が入れ替わる名前（アニメーションは CSS） */
const FlipName = (h: H, front: string, back: string) =>
	h.span
		.class("flip-name")
		.children(
			h.span
				.class("flip-name__inner")
				.children(
					h.span
						.class("flip-name__face", "flip-name__face--front")
						.children(front),
					h.span
						.class("flip-name__face", "flip-name__face--back")
						.attr("aria-hidden", "true")
						.children(back),
				),
		);

const Profile = (h: H) =>
	h.div.class("profile").children(
		h.div
			.class("profile__avatar-frame")
			.children(
				h.img
					.attrs({ src: "/avatar.png", alt: "Ojoxux", fetchpriority: "high" })
					.class("profile__avatar"),
			),
		h.div.class("profile__title-row").children(
			h.a
				.attr("href", "/")
				.class("profile__home-link")
				.children(
					h.h1
						.class("profile__title")
						.children(FlipName(h, "Ojoxux", "Jou Okuyama")),
				),
		),
		h.span
			.class("profile__identifier")
			.children("44112f7c-1326-47f3-bea8-138e5ac9f02d"),
		h.p
			.class("profile__bio")
			.children(
				"Web engineer. Recently interested in functional languages and learning more about them.",
			),
		h.div
			.class("profile__hatena-star")
			// HatenaStar.js が #hatena-star の中にスターを差し込む
			.children(h.span.attr("id", "hatena-star").onMount(LoadHatenaStar())),
		h.div.class("profile__divider").children(WaveDivider(h, "profile")),
		h.div.class("profile__links").children(
			SectionHeading(h, "Links"),
			h.ul.class("social-links").children(
				...socialLinks.map((l) =>
					h.li.class("social-links__item").children(
						h.a
							.attrs({
								href: l.href,
								target: "_blank",
								rel: "noopener noreferrer",
								"aria-label": `${l.label}: ${l.account}`,
							})
							.class("social-links__link")
							.children(
								SocialIconView(h, l.icon),
								h.span.class("social-links__account").children(l.account),
							),
					),
				),
			),
		),
	);

const Visitor = (h: H, model: AppModel) => {
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
							.on("click", AppMessage.ClickedRetryVisit())
							.children("Retry"),
					),
			);
	}
};

/** 第 2 引数は右側の縦線を出すかどうか（Posts パネルだけ）。呼び出し側の children は panel__content に入る */
const Panel = (h: H, rightDivider: boolean) =>
	h.div
		.class("panel__content")
		.forward((content) =>
			h.div
				.class("panel")
				.children(
					h.div
						.class("panel__mobile-divider")
						.children(WaveDivider(h, "default")),
					h.div.class("panel__vertical-divider"),
					rightDivider &&
						h.div.class(
							"panel__vertical-divider",
							"panel__vertical-divider--right",
						),
					content,
				),
		);

export const AppNoDeps = AppDef.make({
	init: ($) =>
		$.set({
			visit: "Loading",
			visitCount: 0,
			countShown: 0,
			countElapsed: null,
			fireworks: true,
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
		ClickedFireworksToggle: ($) => $.evolve({ fireworks: (on) => !on }),
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
				AppMessage.TickedFrame({ delta }),
			),
	],
	view: (h, model) =>
		h.div.class("home").children(
			h.div
				.class("home__background")
				.children(
					h.props.birthday &&
						model.fireworks &&
						h.div.class("fireworks").onMount(RunFireworks()),
				),
			h.div.class("home__container").children(
				h.main.class("home__main").children(
					h.div.class("profile-column").children(
						h.div.class("profile-content").children(
							Profile(h),
							h.div.class("profile-details").children(
								h.props.birthday &&
									h.div.class("birthday-controls").children(
										h.button
											.attrs({
												type: "button",
												"aria-label": model.fireworks
													? "花火を非表示"
													: "花火を表示",
											})
											.class("toggle-button")
											.on("click", AppMessage.ClickedFireworksToggle())
											.children(
												PartyPopperIcon(
													h,
													model.fireworks
														? "party-icon party-icon--active"
														: "party-icon party-icon--inactive",
												),
											),
									),
								h.div
									.class("visitor")
									.children(SectionHeading(h, "Visitor"), Visitor(h, model)),
							),
						),
					),
					Panel(h, false).children(WakaTimePanel(h, h.queries.wakaTime)),
					Panel(h, true).children(PostsPanel(h, h.queries.posts)),
				),
			),
		),
});

export const App = AppNoDeps.pipe(
	Component.provide(
		Layer.mergeAll(PostVisit.layer, GetWakaTime.layer, ListPosts.layer).pipe(
			Layer.provide(Api.layerHttp),
		),
	),
);
