// 旧 fe/test/*.hs（hspec）を移植したもの
import { describe, expect, it } from "vitest";
import {
	countValueAt,
	easeOutCubic,
	filledBlocks,
	formatWithSeparator,
	resolveBirthdayMode,
	roundHalfUp,
	rowBlocks,
} from "../src/core/basics.ts";
import { kin, nishiki, saishiki } from "../src/core/fireworks/palette.ts";
import {
	particleColor,
	updateParticle,
} from "../src/core/fireworks/particle.ts";
import {
	buildProgram,
	riseSpeedFor,
	sectionAt,
} from "../src/core/fireworks/program.ts";
import { Rng } from "../src/core/fireworks/random.ts";
import { explodeShell } from "../src/core/fireworks/shells.ts";
import {
	drawItems,
	isFinished,
	launchAt,
	newShow,
	particleCap,
	resizeShow,
	type ShowState,
	step,
	stepMs,
} from "../src/core/fireworks/show.ts";
import {
	emptyStats,
	formatStats,
	record,
	statFrames,
	statMean,
	statP95,
} from "../src/core/fireworks/stats.ts";
import {
	type Particle,
	type Shell,
	shellSpec,
} from "../src/core/fireworks/types.ts";

describe("roundHalfUp", () => {
	it("JS の Math.round と同じく .5 を切り上げる", () => {
		expect([2.5, 3.5, 1.25, 0].map(roundHalfUp)).toEqual([3, 4, 1, 0]);
	});
});

describe("resolveBirthdayMode", () => {
	it("8/18 は誕生日", () =>
		expect(resolveBirthdayMode(false, false, 8, 18)).toBe(true));
	it("それ以外の日は誕生日ではない", () =>
		expect(resolveBirthdayMode(false, false, 8, 17)).toBe(false));
	it("8 月以外の 18 日は誕生日ではない", () =>
		expect(resolveBirthdayMode(false, false, 7, 18)).toBe(false));
	it("localStorage のフラグがあれば常に誕生日", () =>
		expect(resolveBirthdayMode(true, false, 1, 1)).toBe(true));
	it("ビルド時のフラグがあれば常に誕生日", () =>
		expect(resolveBirthdayMode(false, true, 1, 1)).toBe(true));
});

describe("easeOutCubic", () => {
	it("0 と 1 で端点を返す", () => {
		expect(easeOutCubic(0)).toBe(0);
		expect(easeOutCubic(1)).toBe(1);
	});
	it("範囲外の入力は 0..1 に丸める", () => {
		expect(easeOutCubic(-1)).toBe(0);
		expect(easeOutCubic(2)).toBe(1);
	});
});

describe("countValueAt", () => {
	it("開始時は 0", () => expect(countValueAt(1000, 0)).toBe(0));
	it("半分の時間で ease-out の 87.5%", () =>
		expect(countValueAt(1000, 500)).toBe(875));
	it("所要時間を過ぎたら目標値で止まる", () => {
		expect(countValueAt(1000, 1000)).toBe(1000);
		expect(countValueAt(1000, 5000)).toBe(1000);
	});
});

describe("formatWithSeparator", () => {
	it("3 桁ごとにカンマを入れる", () => {
		expect([0, 999, 1000, 1234567, -1234].map(formatWithSeparator)).toEqual([
			"0",
			"999",
			"1,000",
			"1,234,567",
			"-1,234",
		]);
	});
});

describe("filledBlocks", () => {
	it("1 行は 10 ブロック", () => expect(rowBlocks).toBe(10));
	it("パーセントをブロック数に丸める（.5 は切り上げ）", () => {
		expect([0, 12.5, 25, 75, 100].map(filledBlocks)).toEqual([0, 1, 3, 8, 10]);
	});
	it("0..rowBlocks の範囲に収める", () => {
		expect(filledBlocks(150)).toBe(10);
		expect(filledBlocks(-5)).toBe(0);
	});
});

const sampleParticle = (overrides: Partial<Particle> = {}): Particle => ({
	x: 0,
	y: 0,
	vx: 1,
	vy: 0,
	size: 1,
	drag: 0.5,
	gravity: 0.1,
	life: 10,
	maxLife: 100,
	colorStops: ["#111111", "#222222"],
	flicker: 0,
	trail: true,
	fadeExp: 1,
	split: null,
	...overrides,
});

describe("Fireworks.Particle", () => {
	it("1 ステップで空気抵抗、重力、移動、寿命が進む", () => {
		const p = sampleParticle();
		updateParticle(p);
		expect([p.vx, p.vy, p.x, p.y, p.life]).toEqual([0.5, 0.1, 0.5, 0.1, 9]);
	});
	it("寿命の 45% までは 1 色目", () =>
		expect(particleColor(sampleParticle({ life: 60 }))).toBe("#111111"));
	it("寿命の 45% を過ぎたら 2 色目", () =>
		expect(particleColor(sampleParticle({ life: 50 }))).toBe("#222222"));
	it("1 色だけならその色", () =>
		expect(particleColor(sampleParticle({ colorStops: ["#333333"] }))).toBe(
			"#333333",
		));
	it("色が無ければ白", () =>
		expect(particleColor(sampleParticle({ colorStops: [] }))).toBe("#ffffff"));
});

describe("Fireworks.Program", () => {
	const program = buildProgram(new Rng(5));

	it("at の昇順に並ぶ", () => {
		const ats = program.map((c) => c.at);
		expect(ats).toEqual([...ats].sort((a, b) => a - b));
	});
	it("開幕は 1500 / 5000 / 8500ms の xlarge 3 発", () => {
		const opening = program.slice(0, 3);
		expect(opening.map((c) => c.at)).toEqual([1500, 5000, 8500]);
		expect(opening.map((c) => c.shell.kind)).toEqual([
			"Kiku",
			"ShinIri",
			"IroHenka",
		]);
		expect(opening.every((c) => c.shell.grade === "XLarge")).toBe(true);
	});
	it("止め玉は 58200ms の三重芯", () => {
		const last = program.at(-1);
		expect(last?.at).toBe(58200);
		expect(last?.shell.kind).toBe("ShinIri");
		expect(last?.shell.triple).toBe(true);
	});
	it("フィナーレは 51000〜56560ms に収まる", () => {
		const finale = program.filter((c) => c.at >= 51000 && c.at < 58200);
		expect(finale).toHaveLength(86);
		expect(finale.every((c) => c.at <= 56560)).toBe(true);
	});
	it("同じシードなら同じ演目", () => {
		expect(buildProgram(new Rng(5)).map((c) => c.at)).toEqual(
			program.map((c) => c.at),
		);
	});
	it("区間の境界", () => {
		expect(
			[0, 9999, 10000, 22000, 32500, 43500, 51000, 58200].map(sectionAt),
		).toEqual([
			"Opening",
			"Opening",
			"FirstAct",
			"Starmine",
			"Interlude",
			"SecondStarmine",
			"Finale",
			"Tomedama",
		]);
	});
});

describe("Fireworks.Random", () => {
	const draw = <A>(seed: number, n: number, f: (r: Rng) => A): A[] => {
		const r = new Rng(seed);
		return Array.from({ length: n }, () => f(r));
	};
	it("rand は [lo, hi) に収まる", () => {
		expect(
			draw(1, 1000, (r) => r.rand(2, 5)).every((x) => x >= 2 && x < 5),
		).toBe(true);
	});
	it("randInt は [lo, hi) の整数を返す", () => {
		const xs = draw(2, 1000, (r) => r.randInt(1, 3));
		expect(xs.every((x) => x === 1 || x === 2)).toBe(true);
		expect(xs).toContain(2);
	});
	it("pick は配列の要素を返す", () => {
		expect(
			draw(3, 100, (r) => r.pick(["a", "b", "c"])).every((x) =>
				"abc".includes(x),
			),
		).toBe(true);
	});
	it("同じシードなら同じ系列になる", () => {
		expect(draw(7, 10, (r) => r.rand(0, 1))).toEqual(
			draw(7, 10, (r) => r.rand(0, 1)),
		);
	});
});

describe("Fireworks.Shells", () => {
	const explode = (s: ReturnType<typeof shellSpec>) =>
		explodeShell(new Rng(11), s, 100, 100, 300);

	it("菊（medium）は 65 個", () =>
		expect(explode(shellSpec("Kiku", "Medium", saishiki))).toHaveLength(65));
	it("countScale を掛けて丸める（large × 0.85 = 100）", () =>
		expect(
			explode(shellSpec("Kamuro", "Large", kin, { countScale: 0.85 })),
		).toHaveLength(100));
	it("千輪の星はすべて子星を持つ", () =>
		expect(
			explode(shellSpec("Senrin", "Medium", saishiki)).every(
				(p) => p.split !== null,
			),
		).toBe(true));
	it("千輪以外は子星を持たない", () =>
		expect(
			explode(shellSpec("Botan", "Medium", saishiki)).some(
				(p) => p.split !== null,
			),
		).toBe(false));
	it("色変わりの星は 2 色を持つ", () =>
		expect(
			explode(shellSpec("IroHenka", "Medium", ["#3bff8f", "#ff3b3b"])).every(
				(p) => p.colorStops.length === 2,
			),
		).toBe(true));
	it("三重芯は層の比率どおり（xlarge: 96 + 40 + 24）", () =>
		expect(
			explode(shellSpec("ShinIri", "XLarge", nishiki, { triple: true })),
		).toHaveLength(160));
	it("二重芯（medium）は 46 + 20", () =>
		expect(explode(shellSpec("ShinIri", "Medium", saishiki))).toHaveLength(66));
	it("星は破裂位置から始まる", () =>
		expect(
			explode(shellSpec("Kiku", "Small", saishiki)).every(
				(p) => p.x === 100 && p.y === 100,
			),
		).toBe(true));
});

describe("Fireworks.Show", () => {
	/** 演目なしの空のショー */
	const emptyShow = (overrides: Partial<ShowState> = {}): ShowState =>
		Object.assign(newShow(1, 100, 200), { pending: [] }, overrides);
	const risingShell = (y: number): Shell => ({
		x: 50,
		y,
		vx: 0,
		riseSpeed: 2,
		burstY: 100,
		spec: shellSpec("Kiku", "Small", ["#ffffff"]),
		color: "#ffffff",
	});
	const cueAt = (at: number) => ({
		at,
		shell: shellSpec("Kiku", "XLarge", []),
		xRatio: 0.5,
		burstYRatio: 0.34,
		riseSpeed: riseSpeedFor("XLarge"),
	});

	it("打ち上げ時刻は破裂時刻から上昇時間を引く", () => {
		expect(launchAt(cueAt(1500))).toBeCloseTo(
			1500 - (0.66 / 0.0127) * stepMs,
			9,
		);
	});
	it("打ち上げ時刻が負なら 0", () => expect(launchAt(cueAt(10))).toBe(0));
	it("newShow は演目をすべて未発射で持つ", () =>
		expect(newShow(1, 100, 200).pending.length).toBeGreaterThan(100));
	it("破裂高度に達した玉は星になる", () => {
		const st = emptyShow({ shells: [risingShell(101)] });
		step(st);
		expect(st.shells).toEqual([]);
		expect(st.particles.length).toBeGreaterThanOrEqual(38);
	});
	it("まだ高い玉は上昇を続け、火の粉を出す", () => {
		const st = emptyShow({ shells: [risingShell(150)] });
		step(st);
		expect(st.shells.map((s) => s.y)).toEqual([148]);
		expect(st.particles.length).toBeGreaterThanOrEqual(1);
		expect(st.particles.length).toBeLessThanOrEqual(2);
	});
	it("寿命が尽きた千輪の星は子星を出す", () => {
		const parent = sampleParticle({
			life: 1,
			split: { count: 3, speed: 1, size: 1, life: 22, colors: ["#ffffff"] },
		});
		const st = emptyShow({ particles: [parent] });
		step(st);
		expect(st.particles).toHaveLength(3);
		expect(st.particles.every((p) => p.life === 22)).toBe(true);
	});
	it("粒子は上限で打ち切る", () => {
		const many = Array.from({ length: particleCap }, () =>
			sampleParticle({ life: 1000 }),
		);
		const st = emptyShow({ particles: many, shells: [risingShell(101)] });
		step(st);
		expect(st.particles.length).toBeLessThanOrEqual(particleCap);
	});
	it("すべて消えてから 120 ステップで終わる", () => {
		const st = emptyShow();
		for (let i = 0; i < 119; i++) step(st);
		expect(isFinished(st)).toBe(false);
		step(st);
		expect(isFinished(st)).toBe(true);
	});
	it("粒子があるうちは終わらない", () => {
		const st = emptyShow({
			particles: [sampleParticle({ life: 500, gravity: 0 })],
		});
		for (let i = 0; i < 200; i++) step(st);
		expect(isFinished(st)).toBe(false);
	});
	it("リサイズで座標をスケールする", () => {
		const st = emptyShow({
			particles: [sampleParticle({ x: 10, y: 20 })],
			shells: [risingShell(150)],
		});
		resizeShow(st, 200, 400);
		expect(st.particles.map((p) => [p.x, p.y])).toEqual([[20, 40]]);
		expect(st.shells.map((s) => s.burstY)).toEqual([200]);
		expect([st.width, st.height]).toEqual([200, 400]);
	});
	it("幅か高さが 0 以下のリサイズは無視する", () => {
		const st = emptyShow();
		resizeShow(st, 0, 400);
		expect(st.width).toBe(100);
	});
	it("drawItems は不透明度を寿命と fadeExp から計算する", () => {
		const items = drawItems(
			emptyShow({
				particles: [sampleParticle({ life: 25, maxLife: 100, fadeExp: 2 })],
			}),
		);
		expect(items.map((d) => d.alpha)).toEqual([0.0625]);
	});
	it("drawItems は座標を Math.round と同じく丸める", () => {
		const items = drawItems(
			emptyShow({ particles: [sampleParticle({ x: 2.5, y: 3.4 })] }),
		);
		expect(items.map((d) => [d.x, d.y])).toEqual([[3, 3]]);
	});
	it("シードを変えても newShow は動く", () =>
		expect(newShow(99, 100, 200).pending.length).toBeGreaterThan(100));
});

describe("Fireworks.Stats", () => {
	it("平均と 95 パーセンタイル", () => {
		let s = emptyStats;
		for (let dt = 1; dt <= 100; dt++) s = record(dt, 1, 2, 10, s);
		expect(statMean(s)).toBe(50.5);
		expect(statP95(s)).toBe(96);
		expect(statFrames(s)).toBe(100);
	});
	it("粒子数は最大値を残す", () => {
		expect(
			record(1, 0, 0, 5, record(1, 0, 0, 9, emptyStats)).maxParticles,
		).toBe(9);
	});
	it("1 行に整形する", () => {
		expect(formatStats("Finale", record(20, 1, 2, 3, emptyStats))).toBe(
			"[fireworks:ts] Finale frames=1 mean=20.0ms p95=20.0ms physics=1.00ms render=2.00ms maxParticles=3",
		);
	});
});
