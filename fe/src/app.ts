import { Component } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { Api } from "./api/api.ts";
import { Fireworks } from "./components/fireworks/fireworks.ts";
import { Posts } from "./components/posts/posts.ts";
import { Profile } from "./components/profile/profile.ts";
import { Visitor } from "./components/visitor/visitor.ts";
import { WakaTime } from "./components/waka-time/waka-time.ts";

const Home = Html.component({
	name: "App",
	props: Schema.Struct({
		birthday: Schema.Boolean,
		reducedMotion: Schema.Boolean,
	}),
	model: Schema.Null,
	message: Schema.Never,
}).make({
	init: () => null,
	update: ($) => $.model,
	view: (h) =>
		Fireworks(h, {
			props: { birthday: h.props.birthday },
			view: (fireworks) =>
				h.div.class("home").children(
					h.div.class("home__background").children(fireworks.background(h)),
					h.div.class("home__container").children(
						h.main.class("home__main").children(
							h.div.class("profile-column").children(
								h.div.class("profile-content").children(
									Profile(h, {}),
									h.div.class("profile-details").children(
										fireworks.controls(h),
										Visitor(h, {
											props: {
												reducedMotion: h.props.reducedMotion,
											},
										}),
									),
								),
							),
							WakaTime(h, {}),
							Posts(h, {}),
						),
					),
				),
		}),
});

export const App = Home.pipe(Component.provide(Api.layerHttp));
