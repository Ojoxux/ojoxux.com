import type { Html } from "@effect/ui/html";
import { WaveDivider } from "./wave-divider.ts";

/** 第 2 引数は右側の縦線を出すかどうか（Posts パネルだけ）。呼び出し側の children は panel__content に入る */
export const Panel = <M>(h: Html.H<M>, rightDivider: boolean) =>
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
