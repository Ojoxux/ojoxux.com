/**
 * 花火を描く Mount（旧 Ojoxux.Fireworks.{Loop,Render}）。
 * 粒子は毎フレーム数千個あり Model に載せられないので、物理と描画はこの Mount のスコープの中で回す。
 * 要素が消えるとスコープが閉じ、ループと canvas を片付ける
 */
import { Component, Mount } from "@effect/ui";
import { Effect } from "effect";
import { sectionAt } from "./show/program.ts";
import {
	type DrawItem,
	drawItems,
	fadeAlpha,
	isFinished,
	maxDt,
	maxSteps,
	newShow,
	resizeShow,
	type ShowState,
	step,
	stepMs,
} from "./show/show.ts";
import { emptyStats, formatStats, record, type Stats } from "./show/stats.ts";

/** 実サイズの 1/3 で保持し、CSS で拡大してドット感を出す */
const pixelScale = 3;

interface Contexts {
	readonly trail: CanvasRenderingContext2D;
	readonly sharp: CanvasRenderingContext2D;
}

const measure = (el: HTMLElement): readonly [number, number] => [
	Math.max(1, Math.ceil(el.offsetWidth / pixelScale)),
	Math.max(1, Math.ceil(el.offsetHeight / pixelScale)),
];

/** 残光を少しずつ消す。物理ステップと同じ回数だけ呼ぶ */
const fadeTrail = (cs: Contexts, w: number, h: number): void => {
	const c = cs.trail;
	c.globalCompositeOperation = "destination-out";
	c.globalAlpha = 1;
	c.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
	c.fillRect(0, 0, w, h);
	c.globalCompositeOperation = "lighter";
};

const drawFrame = (
	cs: Contexts,
	w: number,
	h: number,
	items: ReadonlyArray<DrawItem>,
): void => {
	cs.sharp.clearRect(0, 0, w, h);
	for (const d of items) {
		const c = d.trail ? cs.trail : cs.sharp;
		c.globalAlpha = d.alpha;
		c.fillStyle = d.color;
		c.fillRect(d.x, d.y, d.size, d.size);
	}
	cs.trail.globalAlpha = 1;
	cs.sharp.globalAlpha = 1;
};

/** 花火を始め、止める関数を返す。reduced motion や 2d 非対応なら何もしない */
const start = (container: HTMLElement): (() => void) => {
	let stopped = false;
	let frame = 0;
	let cleanup = () => {};

	const begin = () => {
		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reduced || container.offsetWidth <= 0 || container.offsetHeight <= 0)
			return;
		const trail = document.createElement("canvas");
		const sharp = document.createElement("canvas");
		const trailC = trail.getContext("2d");
		const sharpC = sharp.getContext("2d");
		if (!trailC || !sharpC) return;
		const cs: Contexts = { trail: trailC, sharp: sharpC };
		container.append(trail, sharp);

		const sizeCanvases = (w: number, h: number) => {
			for (const c of [trail, sharp]) {
				c.width = w;
				c.height = h;
			}
			// canvas のサイズを変えると合成モードがリセットされるので、そのたびに設定する
			cs.trail.globalCompositeOperation = "lighter";
			cs.sharp.globalCompositeOperation = "lighter";
		};
		const [w0, h0] = measure(container);
		sizeCanvases(w0, h0);
		const st: ShowState = newShow(Math.round(performance.now()), w0, h0);

		const statsOn = location.search.includes("fireworks-stats");
		let section = sectionAt(0);
		let stats: Stats = emptyStats;
		const flushStats = () => console.info(formatStats(section, stats));

		let acc = 0;
		let last = performance.now();
		const onFrame = (ts: number) => {
			if (stopped) return;
			const dt = Math.min(ts - last, maxDt);
			last = ts;
			acc += dt;
			const t0 = performance.now();
			// 固定ステップで物理を進める。残光の減衰は物理ステップと同じ回数だけかけ、コマ落ちしても尾の長さを変えない
			let n = 0;
			while (acc >= stepMs && n < maxSteps) {
				fadeTrail(cs, st.width, st.height);
				step(st);
				acc -= stepMs;
				n++;
			}
			if (n === maxSteps) acc = 0;
			const t1 = performance.now();
			drawFrame(cs, st.width, st.height, drawItems(st));
			const t2 = performance.now();
			if (statsOn) {
				const next = sectionAt(st.elapsed);
				if (next !== section) {
					flushStats();
					section = next;
					stats = emptyStats;
				}
				stats = record(dt, t1 - t0, t2 - t1, st.particles.length, stats);
			}
			if (isFinished(st)) {
				if (statsOn) flushStats();
				cs.trail.clearRect(0, 0, st.width, st.height);
				cs.sharp.clearRect(0, 0, st.width, st.height);
				return;
			}
			frame = requestAnimationFrame(onFrame);
		};

		const onResize = () => {
			const [w, h] = measure(container);
			sizeCanvases(w, h);
			resizeShow(st, w, h);
		};
		window.addEventListener("resize", onResize);

		cleanup = () => {
			window.removeEventListener("resize", onResize);
			trail.remove();
			sharp.remove();
		};
		frame = requestAnimationFrame(onFrame);
	};

	// 要素が挿入された直後はレイアウトが確定していないことがあるので、1 フレーム待ってから測る
	frame = requestAnimationFrame(() => {
		if (!stopped) begin();
	});

	return () => {
		stopped = true;
		cancelAnimationFrame(frame);
		cleanup();
	};
};

/**
 * 要素が生きている間だけ花火を上げる。結果は送らない。
 * Mount のスコープは要素が消えたときに閉じるので、止める処理は acquireRelease の release に置く
 */
export const RunFireworks = Mount.make(
	"RunFireworks",
	{},
	(node: HTMLElement) =>
		Effect.acquireRelease(
			Effect.sync(() => start(node)),
			(stop) => Effect.sync(stop),
		).pipe(Effect.as(Component.noop)),
);
