import { UiSchema } from "@effect/ui";
import { Html } from "@effect/ui/html";
import { Schema } from "effect";
import { PartyPopperIcon } from "../shared/icons.ts";
import { RunFireworks } from "./run-fireworks.ts";

const FireworksMessage = UiSchema.TaggedEnum({
	ClickedToggle: {},
});

// 背景と操作ボタンを別々の位置に置き、表示状態は一つのコンポーネントで持つ。
export const Fireworks = Html.component({
	name: "Fireworks",
	props: Schema.Struct({ birthday: Schema.Boolean }),
	model: Schema.Boolean,
	message: FireworksMessage,
}).make({
	init: () => true,
	update: { ClickedToggle: ($) => !$.model },
	parts: (p, enabled) => {
		const mount = p.part("div", (b) => b.onMount(RunFireworks()));
		const toggle = p.part("button", (b) =>
			b.on("click", FireworksMessage.ClickedToggle()),
		);

		return {
			background: <M>(h: Html.H<M>) =>
				p.props.birthday && enabled && mount(h.div.class("fireworks")),
			controls: <M>(h: Html.H<M>) =>
				p.props.birthday &&
				h.div.class("birthday-controls").children(
					toggle(
						h.button
							.attrs({
								type: "button",
								"aria-label": enabled ? "花火を非表示" : "花火を表示",
							})
							.class("toggle-button"),
					).children(
						PartyPopperIcon(
							h,
							enabled
								? "party-icon party-icon--active"
								: "party-icon party-icon--inactive",
						),
					),
				),
		};
	},
});
