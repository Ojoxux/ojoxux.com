import type { Html } from "@effect/ui/html";

/** WaveDefault: パネルの区切り / WaveProfile: プロフィールの下 */
export const WaveDivider = <M>(h: Html.H<M>, wave: "default" | "profile") =>
	h.div
		.attr("aria-hidden", "true")
		.class("wave", wave === "profile" && "wave--profile");
