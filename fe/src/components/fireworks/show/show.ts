/**
 * ショー全体の状態と 1 ステップ（1/60 秒）の物理。
 * 描画とタイミング（requestAnimationFrame）は ../run-fireworks.ts が持つ。
 * 物理ステップごとに粒子の状態をその場で更新する。
 */
import { roundHalfUp } from "../../shared/round-half-up.ts";
import { white } from "./palette.ts";
import { particleColor, updateParticle } from "./particle.ts";
import { buildProgram } from "./program.ts";
import { Rng } from "./random.ts";
import { explodeShell } from "./shells.ts";
import type { Color, Cue, Particle, Shell, SplitSpec } from "./types.ts";

export const stepMs = 1000 / 60;
export const maxDt = 100;
export const fadeAlpha = 0.09;
export const maxSteps = 3;
export const particleCap = 12000;
export const drainSteps = 120;

export interface ShowState {
	width: number;
	height: number;
	/** 未発射の演目と打ち上げ時刻（ms）。時刻の昇順 */
	pending: Array<{ readonly launchAt: number; readonly cue: Cue }>;
	shells: Shell[];
	particles: Particle[];
	/** ショー開始からの経過時間（ms、ステップ単位で進む） */
	elapsed: number;
	/** すべて消えてからのステップ数。残光を拭い切るまで待つ */
	drain: number;
	readonly rng: Rng;
}

/** 描く 1 粒 */
export interface DrawItem {
	readonly x: number;
	readonly y: number;
	readonly size: number;
	readonly color: Color;
	readonly alpha: number;
	readonly trail: boolean;
}

/**
 * riseSpeed は高さに対する比率かつ垂直成分なので、高さが約分されて
 * 上昇時間がビューポートの高さに依存しない
 */
export const launchAt = (c: Cue): number =>
	Math.max(0, c.at - ((1 - c.burstYRatio) / c.riseSpeed) * stepMs);

export const newShow = (
	seed: number,
	width: number,
	height: number,
): ShowState => {
	const rng = new Rng(seed);
	const program = buildProgram(rng);
	return {
		width,
		height,
		pending: program
			.map((cue) => ({ launchAt: launchAt(cue), cue }))
			.sort((a, b) => a.launchAt - b.launchAt),
		shells: [],
		particles: [],
		elapsed: 0,
		drain: 0,
		rng,
	};
};

export const isIdle = (st: ShowState): boolean =>
	st.pending.length === 0 &&
	st.shells.length === 0 &&
	st.particles.length === 0;

export const isFinished = (st: ShowState): boolean => st.drain >= drainSteps;

export const step = (st: ShowState): void => {
	const t = st.elapsed + stepMs;
	const { rng, width: w, height: h } = st;

	let due = 0;
	while (
		due < st.pending.length &&
		(st.pending[due]?.launchAt ?? Infinity) <= t
	)
		due++;
	const launched = st.pending
		.splice(0, due)
		.map(({ cue }) => launchShell(rng, w, h, cue));

	const born: Particle[] = [];
	const rising: Shell[] = [];
	for (const s of [...st.shells, ...launched]) {
		if (moveShell(rng, h, s, born)) rising.push(s);
	}

	// 新しい粒子を先頭に置き、上限を超えた分は末尾（古い粒子）から捨てる
	const combined = born.concat(st.particles);
	if (combined.length > particleCap) combined.length = particleCap;

	const next: Particle[] = [];
	for (const p of combined) {
		updateParticle(p);
		if (p.life > 0) next.push(p);
		else if (p.split) children(rng, p, p.split, next);
	}

	st.shells = rising;
	st.particles = next;
	st.elapsed = t;
	st.drain = isIdle(st) ? st.drain + 1 : 0;
};

const launchShell = (rng: Rng, w: number, h: number, c: Cue): Shell => {
	const speed = c.riseSpeed * h;
	const drift = rng.rand(-0.15, 0.15);
	return {
		x: c.xRatio * w,
		y: h,
		vx: drift * speed,
		riseSpeed: speed,
		burstY: c.burstYRatio * h,
		spec: c.shell,
		color: c.shell.palette[0] ?? white,
	};
};

/** 玉を 1 ステップ上げ、曲導の火の粉を出す。破裂したら星を out に足して false を返す */
const moveShell = (rng: Rng, h: number, s: Shell, out: Particle[]): boolean => {
	s.x += s.vx;
	s.y -= s.riseSpeed;
	const n = rng.randInt(1, 3);
	for (let i = 0; i < n; i++) out.push(spark(rng, h, s));
	if (s.y <= s.burstY) {
		for (const p of explodeShell(rng, s.spec, s.x, s.y, h)) out.push(p);
		return false;
	}
	return true;
};

/** 曲導の火の粉 */
const spark = (rng: Rng, h: number, s: Shell): Particle => {
	const dx = rng.rand(-0.001, 0.001);
	const dy = rng.rand(0.0007, 0.0027);
	return {
		x: s.x,
		y: s.y,
		vx: dx * h,
		vy: dy * h,
		size: 1,
		drag: 0.94,
		gravity: 0.00007 * h,
		life: 18,
		maxLife: 18,
		colorStops: [s.color],
		flicker: 0.25,
		trail: true,
		fadeExp: 1.2,
		split: null,
	};
};

/** 千輪の子星。このステップでは動かさない */
const children = (
	rng: Rng,
	parent: Particle,
	sp: SplitSpec,
	out: Particle[],
): void => {
	for (let i = 0; i < sp.count; i++) {
		const angle = rng.rand(0, 2 * Math.PI);
		const speed = sp.speed * rng.rand(0.5, 1);
		out.push({
			x: parent.x,
			y: parent.y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			size: sp.size,
			drag: 0.96,
			gravity: 0.045,
			life: sp.life,
			maxLife: sp.life,
			colorStops: sp.colors,
			flicker: 0,
			trail: false,
			fadeExp: 1.4,
			split: null,
		});
	}
};

/** 描く粒子。明滅（flicker）で描かない粒子を間引くため乱数を進める */
export const drawItems = (st: ShowState): DrawItem[] => {
	const items: DrawItem[] = [];
	for (const p of st.particles) {
		if (p.flicker > 0 && st.rng.rand(0, 1) < p.flicker) continue;
		items.push({
			x: roundHalfUp(p.x),
			y: roundHalfUp(p.y),
			size: p.size,
			color: particleColor(p),
			alpha: (p.life / p.maxLife) ** p.fadeExp,
			trail: p.trail,
		});
	}
	return items;
};

/** canvas のサイズが変わったら、粒子と玉の座標をスケールする */
export const resizeShow = (st: ShowState, w: number, h: number): void => {
	if (w <= 0 || h <= 0) return;
	const kx = w / st.width;
	const ky = h / st.height;
	for (const p of st.particles) {
		p.x *= kx;
		p.y *= ky;
	}
	for (const s of st.shells) {
		s.x *= kx;
		s.y *= ky;
		s.burstY *= ky;
		s.vx *= kx;
		s.riseSpeed *= ky;
	}
	st.width = w;
	st.height = h;
};
