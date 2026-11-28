// ブラウザのエントリ。プラットフォームの Layer（HTTP クライアント）だけを渡して App をマウントする
import { BrowserHost } from "@effect/ui/html";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/http";
import "../styles.css";
import { App } from "./app.ts";
import { resolveBirthdayMode } from "./components/fireworks/birthday-mode.ts";

const readBirthdayFlag = (): boolean => {
	try {
		return localStorage.getItem("birthday") === "1";
	} catch {
		return false;
	}
};

const now = new Date();
const birthday = resolveBirthdayMode(
	readBirthdayFlag(),
	import.meta.env.VITE_BIRTHDAY_MODE === "1",
	now.getMonth() + 1,
	now.getDate(),
);
const reducedMotion = window.matchMedia(
	"(prefers-reduced-motion: reduce)",
).matches;

const root = document.getElementById("app");
if (!root) throw new Error("#app がない");

const Main = BrowserHost.mount(App, { birthday, reducedMotion }, root).pipe(
	Layer.provide(FetchHttpClient.layer),
);

Layer.launch(Main).pipe(Effect.runFork);

// 最初の描画が済んだら、起動前のスケルトンを外す
requestAnimationFrame(() => document.getElementById("boot")?.remove());
