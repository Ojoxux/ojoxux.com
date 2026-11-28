// はてなスターを読み込む Mount
import { Component, Mount } from "@effect/ui";
import { Effect } from "effect";

const HATENA_STAR_SRC = "https://s.hatena.ne.jp/js/HatenaStar.js";

type HatenaWindow = Window & {
	Hatena?: {
		Star: {
			SiteConfig: {
				entryNodes: Record<
					string,
					{ uri: string; title: string; container: string }
				>;
			};
		};
	};
};

const loadHatenaStar = (): void => {
	if (document.querySelector(`script[src="${HATENA_STAR_SRC}"]`)) return;

	const script = document.createElement("script");
	script.src = HATENA_STAR_SRC;
	script.async = true;
	script.addEventListener("load", () => {
		const hatena = (window as HatenaWindow).Hatena;
		if (!hatena) return;
		hatena.Star.SiteConfig = {
			entryNodes: {
				body: {
					uri: "document.location",
					title: "document.title",
					container: "#hatena-star",
				},
			},
		};
		// HatenaStar.js は window の "DOMContentLoaded" で初期化されるけど，動的読み込みだと発火済みで間に合わないので手動で再発火させる。
		window.dispatchEvent(new Event("DOMContentLoaded"));
	});
	script.addEventListener("error", () => {
		console.warn("Failed to load HatenaStar.js");
	});
	document.head.append(script);
};

/** #hatena-star が描かれたら HatenaStar.js を読み込む。スターは HatenaStar.js がこの要素の中に差し込む */
export const LoadHatenaStar = Mount.make(
	"LoadHatenaStar",
	{},
	(_node: HTMLElement) =>
		Effect.sync(loadHatenaStar).pipe(Effect.as(Component.noop)),
);
