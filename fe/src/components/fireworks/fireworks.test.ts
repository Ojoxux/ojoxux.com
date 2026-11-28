import { Html } from "@effect/ui/html";
import { HtmlScene } from "@effect/ui/html/testing";
import { Locator } from "@effect/ui/testing";
import { describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { Fireworks } from "./fireworks.ts";
import { RunFireworks } from "./run-fireworks.ts";

const background = Locator.attr("class", "fireworks");
const controls = Locator.attr("class", "birthday-controls");
const hide = Locator.attr("aria-label", "花火を非表示");
const show = Locator.attr("aria-label", "花火を表示");
const scene = (birthday: boolean) =>
	HtmlScene.make(
		Fireworks,
		{ birthday },
		{
			elements: Html.vocabulary,
			view: (fireworks, h) =>
				h.div(fireworks.background(h), fireworks.controls(h)),
		},
	);

describe("Fireworks", () => {
	it.effect("誕生日モードでは花火を表示し、ボタンで表示を切り替える", () =>
		Effect.gen(function* () {
			const s = yield* scene(true);
			s.expect(background)
				.toExist()
				.expectMount(RunFireworks())
				.click(hide)
				.expect(background)
				.toBeAbsent()
				.click(show)
				.expect(background)
				.toExist()
				.expect(hide)
				.toExist()
				.expectMount(RunFireworks());
		}),
	);

	it.effect("誕生日モード以外では花火もボタンも表示しない", () =>
		Effect.gen(function* () {
			const s = yield* scene(false);
			s.expect(background).toBeAbsent().expect(controls).toBeAbsent();
		}),
	);
});
