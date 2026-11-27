// ?fireworks-stats のときの計測値。区間ごとに集めて 1 行に整形する（旧 Ojoxux.Core.Fireworks.Stats）
import type { Section } from "./program.ts";

export interface Stats {
	readonly dts: ReadonlyArray<number>;
	readonly physicsTotal: number;
	readonly renderTotal: number;
	readonly maxParticles: number;
}

export const emptyStats: Stats = {
	dts: [],
	physicsTotal: 0,
	renderTotal: 0,
	maxParticles: 0,
};

/** 1 フレーム分を記録する（フレーム間隔、物理と描画の所要時間 ms、粒子数） */
export const record = (
	dt: number,
	physics: number,
	render: number,
	n: number,
	s: Stats,
): Stats => ({
	dts: [...s.dts, dt],
	physicsTotal: s.physicsTotal + physics,
	renderTotal: s.renderTotal + render,
	maxParticles: Math.max(n, s.maxParticles),
});

export const statFrames = (s: Stats): number => s.dts.length;

export const statMean = (s: Stats): number =>
	s.dts.length === 0 ? 0 : s.dts.reduce((a, b) => a + b, 0) / s.dts.length;

/** 95 パーセンタイル（ソートして floor(n * 0.95) 番目、0 始まり） */
export const statP95 = (s: Stats): number => {
	if (s.dts.length === 0) return 0;
	const sorted = [...s.dts].sort((a, b) => a - b);
	return sorted[
		Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))
	] as number;
};

export const formatStats = (section: Section, s: Stats): string => {
	const frames = statFrames(s);
	const perFrame = (total: number) => (frames === 0 ? 0 : total / frames);
	return (
		`[fireworks:ts] ${section} frames=${frames} mean=${statMean(s).toFixed(1)}ms ` +
		`p95=${statP95(s).toFixed(1)}ms physics=${perFrame(s.physicsTotal).toFixed(2)}ms ` +
		`render=${perFrame(s.renderTotal).toFixed(2)}ms maxParticles=${s.maxParticles}`
	);
};
