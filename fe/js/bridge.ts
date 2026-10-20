// Haskell（fe/src/Ojoxux/Ffi.hs）から globalThis.ojoxux 経由で呼ぶ関数群
export interface OjoxuxBridge {
	birthdayFacts(): BirthdayFacts;
	prefersReducedMotion(): boolean;
	initHatenaStar(): void;
}

// 誕生日判定の材料。判定そのものは Haskell の resolveBirthdayMode が行う
export interface BirthdayFacts {
	storageFlag: boolean;
	envFlag: boolean;
	// 1 始まり
	month: number;
	day: number;
}

declare global {
	var ojoxux: OjoxuxBridge;
}

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

const BIRTHDAY_FLAG_KEY = "birthday";
function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const HATENA_STAR_SRC = "https://s.hatena.ne.jp/js/HatenaStar.js";

function readBirthdayFlag(): boolean {
	try {
		return localStorage.getItem(BIRTHDAY_FLAG_KEY) === "1";
	} catch {
		return false;
	}
}

function initHatenaStar(): void {
	if (document.querySelector(`script[src="${HATENA_STAR_SRC}"]`)) {
		return;
	}

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
}

export function createBridge(options: { birthdayEnv: boolean }): OjoxuxBridge {
	return {
		birthdayFacts() {
			const now = new Date();
			return {
				storageFlag: readBirthdayFlag(),
				envFlag: options.birthdayEnv,
				month: now.getMonth() + 1,
				day: now.getDate(),
			};
		},
		prefersReducedMotion,
		initHatenaStar,
	};
}
