import {
	GIN,
	IRO_HENKA_PAIRS,
	KIN,
	NISHIKI,
	pick,
	rand,
	SAISHIKI,
} from "./random";
import type { Cue, ShellGrade, ShellKind, ShellSpec } from "./types";

// 高さに対する比率で持つと、上昇時間がビューポートの高さに依存しなくなる
const RISE_SPEED: Record<ShellGrade, number> = {
	small: 0.0087,
	medium: 0.01,
	large: 0.0113,
	xlarge: 0.0127,
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

function cue(
	at: number,
	shell: ShellSpec,
	xRatio: number,
	burstYRatio: number,
): Cue {
	return {
		at,
		shell,
		xRatio,
		burstYRatio,
		riseSpeed: RISE_SPEED[shell.grade],
	};
}

function shellFor(kind: ShellKind, grade: ShellGrade): ShellSpec {
	switch (kind) {
		case "kamuro":
			return { kind, grade, palette: KIN };
		case "iroHenka":
			return { kind, grade, palette: pick(IRO_HENKA_PAIRS) };
		case "shinIri":
			return {
				kind,
				grade,
				palette: [pick(SAISHIKI)],
				corePalette: GIN,
			};
		default:
			return { kind, grade, palette: [pick(SAISHIKI)] };
	}
}

export function openingCues(): Cue[] {
	return [
		cue(1500, { kind: "kiku", grade: "xlarge", palette: NISHIKI }, 0.5, 0.34),
		cue(
			5000,
			{
				kind: "shinIri",
				grade: "xlarge",
				palette: [pick(SAISHIKI)],
				corePalette: GIN,
			},
			0.3,
			0.36,
		),
		cue(
			8500,
			{ kind: "iroHenka", grade: "xlarge", palette: pick(IRO_HENKA_PAIRS) },
			0.7,
			0.38,
		),
	];
}

const FIRST_ACT_KINDS: ShellKind[] = [
	"kiku",
	"botan",
	"senrin",
	"iroHenka",
	"botan",
	"shinIri",
	"senrin",
	"kiku",
];

export function firstActCues(): Cue[] {
	const cues: Cue[] = [];
	let at = 10000;
	for (const kind of FIRST_ACT_KINDS) {
		cues.push(
			cue(at, shellFor(kind, "medium"), rand(0.15, 0.85), rand(0.25, 0.45)),
		);
		at += rand(1400, 1900);
	}
	return cues;
}

export function starmineCues(): Cue[] {
	const cues: Cue[] = [];
	const start = 22000;
	const end = 31500;
	let at = start;
	while (at <= end) {
		const progress = (at - start) / (end - start);
		const sweep = 0.5 + Math.sin(progress * Math.PI * 3) * 0.35;
		const kind: ShellKind = Math.random() < 0.8 ? "botan" : "kiku";
		cues.push(
			cue(
				at,
				shellFor(kind, "small"),
				clamp01(sweep + rand(-0.08, 0.08)),
				rand(0.3, 0.55),
			),
		);
		at += rand(150, 270);
	}
	return cues;
}

export function interludeCues(): Cue[] {
	const goldRain = (at: number, xRatio: number): Cue =>
		cue(
			at,
			{ kind: "kamuro", grade: "small", palette: KIN, lifeScale: 1.3 },
			xRatio,
			0.18,
		);
	return [
		cue(32500, { kind: "kamuro", grade: "large", palette: KIN }, 0.35, 0.26),
		cue(35000, { kind: "senrin", grade: "medium", palette: GIN }, 0.65, 0.3),
		cue(37500, { kind: "kamuro", grade: "large", palette: KIN }, 0.5, 0.24),
		goldRain(40000, 0.25),
		goldRain(40600, 0.5),
		goldRain(41200, 0.75),
	];
}

export function secondStarmineCues(): Cue[] {
	const cues: Cue[] = [];
	const start = 43500;
	const end = 50500;
	let at = start;
	let index = 0;
	while (at <= end) {
		const grade: ShellGrade = index % 3 === 0 ? "medium" : "small";
		const xRatio = index % 2 === 0 ? rand(0.12, 0.45) : rand(0.55, 0.88);
		cues.push(
			cue(
				at,
				{ kind: "iroHenka", grade, palette: pick(IRO_HENKA_PAIRS) },
				xRatio,
				rand(0.28, 0.5),
			),
		);
		at += rand(120, 210);
		index++;
	}
	return cues;
}

export function finaleCues(): Cue[] {
	const cues: Cue[] = [];
	for (let at = 51000; at <= 56500; at += 130) {
		for (let i = 0; i < 2; i++) {
			const roll = Math.random();
			let spec: ShellSpec;
			if (roll < 0.4) {
				spec = {
					kind: "kamuro",
					grade: "large",
					palette: KIN,
					countScale: 0.85,
				};
			} else if (roll < 0.8) {
				spec = {
					kind: "kiku",
					grade: "large",
					palette: [pick(SAISHIKI)],
					countScale: 0.85,
				};
			} else {
				spec = {
					kind: "shinIri",
					grade: "large",
					palette: [pick(SAISHIKI)],
					corePalette: GIN,
					countScale: 0.85,
				};
			}
			cues.push(
				cue(at + rand(0, 60), spec, rand(0.08, 0.92), rand(0.26, 0.54)),
			);
		}
	}
	return cues;
}

// 56.5s のフィナーレ最終破裂から 1.7 秒の間を置く。at はこれに追従させること
export function tomedamaCues(): Cue[] {
	return [
		cue(
			58200,
			{
				kind: "shinIri",
				grade: "xlarge",
				palette: NISHIKI,
				corePalette: GIN,
				triple: true,
				lifeScale: 1.4,
			},
			0.5,
			0.34,
		),
	];
}

export function buildProgram(): Cue[] {
	return [
		...openingCues(),
		...firstActCues(),
		...starmineCues(),
		...interludeCues(),
		...secondStarmineCues(),
		...finaleCues(),
		...tomedamaCues(),
	].sort((a, b) => a.at - b.at);
}
