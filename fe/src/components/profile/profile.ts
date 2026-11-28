import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { GithubIcon, XIcon, ZennIcon } from "../shared/icons.ts";
import { SectionHeading } from "../shared/section-heading.ts";
import { WaveDivider } from "../shared/wave-divider.ts";
import { LoadHatenaStar } from "./load-hatena-star.ts";

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

const SocialIconView = (h: Html.H<never>, icon: SocialIcon) => {
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
const FlipName = (h: Html.H<never>, front: string, back: string) =>
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

export const Profile = Html.component({
	name: "Profile",
	model: Schema.Null,
	message: Schema.Never,
}).make({
	init: () => null,
	update: ($) => $.model,
	view: (h) =>
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
		),
});
