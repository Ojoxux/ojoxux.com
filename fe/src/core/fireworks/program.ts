// 約 58 秒の演目（旧 Ojoxux.Core.Fireworks.Program）
import { gin, iroHenkaPairs, kin, nishiki, saishiki } from "./palette.ts";
import type { Rng } from "./random.ts";
import {
	type Cue,
	type Grade,
	type Kind,
	type ShellSpec,
	shellSpec,
} from "./types.ts";

/** 高さに対する比率で持つと、上昇時間がビューポートの高さに依存しない */
export const riseSpeedFor = (grade: Grade): number => {
	switch (grade) {
		case "Small":
			return 0.0087;
		case "Medium":
			return 0.01;
		case "Large":
			return 0.0113;
		case "XLarge":
			return 0.0127;
	}
};

const cue = (
	at: number,
	shell: ShellSpec,
	xRatio: number,
	burstYRatio: number,
): Cue => ({
	at,
	shell,
	xRatio,
	burstYRatio,
	riseSpeed: riseSpeedFor(shell.grade),
});

const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

const shellFor = (rng: Rng, kind: Kind, grade: Grade): ShellSpec => {
	switch (kind) {
		case "Kamuro":
			return shellSpec(kind, grade, kin);
		case "IroHenka":
			return shellSpec(kind, grade, rng.pick(iroHenkaPairs));
		case "ShinIri":
			return shellSpec(kind, grade, [rng.pick(saishiki)], { corePalette: gin });
		default:
			return shellSpec(kind, grade, [rng.pick(saishiki)]);
	}
};

const openingCues = (rng: Rng): Cue[] => {
	const c1 = rng.pick(saishiki);
	const pair = rng.pick(iroHenkaPairs);
	return [
		cue(1500, shellSpec("Kiku", "XLarge", nishiki), 0.5, 0.34),
		cue(
			5000,
			shellSpec("ShinIri", "XLarge", [c1], { corePalette: gin }),
			0.3,
			0.36,
		),
		cue(8500, shellSpec("IroHenka", "XLarge", pair), 0.7, 0.38),
	];
};

const firstActCues = (rng: Rng): Cue[] => {
	const kinds: Kind[] = [
		"Kiku",
		"Botan",
		"Senrin",
		"IroHenka",
		"Botan",
		"ShinIri",
		"Senrin",
		"Kiku",
	];
	const cues: Cue[] = [];
	let t = 10000;
	for (const k of kinds) {
		const s = shellFor(rng, k, "Medium");
		const xr = rng.rand(0.15, 0.85);
		const by = rng.rand(0.25, 0.45);
		const dt = rng.rand(1400, 1900);
		cues.push(cue(t, s, xr, by));
		t += dt;
	}
	return cues;
};

const starmineCues = (rng: Rng): Cue[] => {
	const start = 22000;
	const end = 31500;
	const cues: Cue[] = [];
	for (let t = start; t <= end; ) {
		const progress = (t - start) / (end - start);
		const sweep = 0.5 + Math.sin(progress * Math.PI * 3) * 0.35;
		const roll = rng.rand(0, 1);
		const s = shellFor(rng, roll < 0.8 ? "Botan" : "Kiku", "Small");
		const jitter = rng.rand(-0.08, 0.08);
		const by = rng.rand(0.3, 0.55);
		const dt = rng.rand(150, 270);
		cues.push(cue(t, s, clamp01(sweep + jitter), by));
		t += dt;
	}
	return cues;
};

const interludeCues = (): Cue[] => {
	const goldRain = (t: number, xr: number) =>
		cue(t, shellSpec("Kamuro", "Small", kin, { lifeScale: 1.3 }), xr, 0.18);
	return [
		cue(32500, shellSpec("Kamuro", "Large", kin), 0.35, 0.26),
		cue(35000, shellSpec("Senrin", "Medium", gin), 0.65, 0.3),
		cue(37500, shellSpec("Kamuro", "Large", kin), 0.5, 0.24),
		goldRain(40000, 0.25),
		goldRain(40600, 0.5),
		goldRain(41200, 0.75),
	];
};

const secondStarmineCues = (rng: Rng): Cue[] => {
	const end = 50500;
	const cues: Cue[] = [];
	for (let t = 43500, i = 0; t <= end; i++) {
		const g: Grade = i % 3 === 0 ? "Medium" : "Small";
		const xr = i % 2 === 0 ? rng.rand(0.12, 0.45) : rng.rand(0.55, 0.88);
		const pair = rng.pick(iroHenkaPairs);
		const by = rng.rand(0.28, 0.5);
		const dt = rng.rand(120, 210);
		cues.push(cue(t, shellSpec("IroHenka", g, pair), xr, by));
		t += dt;
	}
	return cues;
};

const finaleCues = (rng: Rng): Cue[] => {
	const one = (t: number): Cue => {
		const roll = rng.rand(0, 1);
		let s: ShellSpec;
		if (roll < 0.4) {
			s = shellSpec("Kamuro", "Large", kin, { countScale: 0.85 });
		} else {
			const c = rng.pick(saishiki);
			s =
				roll < 0.8
					? shellSpec("Kiku", "Large", [c], { countScale: 0.85 })
					: shellSpec("ShinIri", "Large", [c], {
							corePalette: gin,
							countScale: 0.85,
						});
		}
		const dt = rng.rand(0, 60);
		const xr = rng.rand(0.08, 0.92);
		const by = rng.rand(0.26, 0.54);
		return cue(t + dt, s, xr, by);
	};
	const cues: Cue[] = [];
	for (let t = 51000; t <= 56500; t += 130) {
		cues.push(one(t), one(t));
	}
	return cues;
};

/** 56.5s のフィナーレ最終破裂から 1.7 秒の間を置く */
const tomedamaCues = (): Cue[] => [
	cue(
		58200,
		shellSpec("ShinIri", "XLarge", nishiki, {
			corePalette: gin,
			triple: true,
			lifeScale: 1.4,
		}),
		0.5,
		0.34,
	),
];

export const buildProgram = (rng: Rng): Cue[] =>
	[
		...openingCues(rng),
		...firstActCues(rng),
		...starmineCues(rng),
		...interludeCues(),
		...secondStarmineCues(rng),
		...finaleCues(rng),
		...tomedamaCues(),
	].sort((a, b) => a.at - b.at);

/** 計測で使う演目の区間 */
export type Section =
	| "Opening"
	| "FirstAct"
	| "Starmine"
	| "Interlude"
	| "SecondStarmine"
	| "Finale"
	| "Tomedama";

/** 経過時間（ms）が属する区間 */
export const sectionAt = (t: number): Section => {
	if (t < 10000) return "Opening";
	if (t < 22000) return "FirstAct";
	if (t < 32500) return "Starmine";
	if (t < 43500) return "Interlude";
	if (t < 51000) return "SecondStarmine";
	if (t < 58200) return "Finale";
	return "Tomedama";
};
