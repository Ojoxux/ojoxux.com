// 玉の破裂で星を生成する（旧 Ojoxux.Core.Fireworks.Shells）
import { roundHalfUp } from "../../shared/round-half-up.ts";
import { gin, kin, white } from "./palette.ts";
import type { Rng } from "./random.ts";
import type { Color, Grade, Particle, ShellSpec, SplitSpec } from "./types.ts";

export interface GradeParams {
	readonly count: number;
	/** canvas の高さに対する比率。解像度に依存しないようにするため */
	readonly radiusMin: number;
	readonly radiusMax: number;
	readonly lifeScale: number;
}

/**
 * 星の数は半径とセットで決める。星が 1 粒ずつ判別できるには外周で 3〜4px
 * 程度の間隔が要るので、上限はおおよそ 2πr / 3.5 になる
 */
export const gradeParams = (grade: Grade): GradeParams => {
	switch (grade) {
		case "Small":
			return { count: 38, radiusMin: 0.065, radiusMax: 0.1, lifeScale: 0.85 };
		case "Medium":
			return { count: 65, radiusMin: 0.105, radiusMax: 0.16, lifeScale: 1.0 };
		case "Large":
			return { count: 118, radiusMin: 0.19, radiusMax: 0.25, lifeScale: 1.15 };
		case "XLarge":
			return { count: 160, radiusMin: 0.26, radiusMax: 0.32, lifeScale: 1.5 };
	}
};

/** 星 1 つの作り方 */
interface Recipe {
	readonly drag: number;
	readonly speedScale: number;
	/** 終端落下速度を「1 秒で画面高さの何割落ちるか」で指定する */
	readonly fallPerSecond: number;
	readonly colors: (rng: Rng) => ReadonlyArray<Color>;
	readonly life: readonly [number, number];
	readonly fadeExp: number;
	readonly trail: boolean;
	readonly flicker: number;
	readonly split: (rng: Rng) => SplitSpec | null;
}

const baseRecipe = (
	drag: number,
	fallPerSecond: number,
	colors: (rng: Rng) => ReadonlyArray<Color>,
	life: readonly [number, number],
	overrides: Partial<Recipe> = {},
): Recipe => ({
	drag,
	speedScale: 1,
	fallPerSecond,
	colors,
	life,
	fadeExp: 1,
	trail: true,
	flicker: 0,
	split: () => null,
	...overrides,
});

const one =
	(colors: ReadonlyArray<Color>) =>
	(rng: Rng): ReadonlyArray<Color> => [rng.pick(colors)];

export const explodeShell = (
	rng: Rng,
	s: ShellSpec,
	x: number,
	y: number,
	height: number,
): Particle[] => {
	const g = gradeParams(s.grade);
	const pal = s.palette;
	const count = roundHalfUp(g.count * s.countScale);
	const lifeMul = g.lifeScale * s.lifeScale;
	const single = one(pal);
	// 半径は 1 発につき 1 回だけ決める。星ごとに引き直すと球殻ではなく円盤になる
	const shellRadius = rng.rand(g.radiusMin, g.radiusMax);

	const star = (r: Recipe): Particle => {
		const jitter = rng.rand(0.96, 1.04);
		const colorStops = r.colors(rng);
		const size = rng.randInt(1, 3);
		const life = roundHalfUp(rng.rand(r.life[0], r.life[1]) * lifeMul);
		const split = r.split(rng);
		// 指数減衰する星の到達距離は 初速 / (1 - drag)。目標半径から逆算する
		const speed = shellRadius * jitter * height * r.speedScale * (1 - r.drag);
		const [vx, vy] = starVelocity(rng, speed);
		return {
			x,
			y,
			vx,
			vy,
			size,
			drag: r.drag,
			gravity: ((r.fallPerSecond * height) / 60) * (1 - r.drag),
			life,
			maxLife: life,
			colorStops,
			flicker: r.flicker,
			trail: r.trail,
			fadeExp: r.fadeExp,
			split,
		};
	};
	const times = (n: number, r: Recipe): Particle[] =>
		Array.from({ length: n }, () => star(r));

	switch (s.kind) {
		case "Kiku":
			return times(count, baseRecipe(0.975, 0.08, single, [70, 100]));
		case "Botan":
			return times(
				count,
				baseRecipe(0.965, 0.11, single, [40, 60], {
					fadeExp: 1.6,
					trail: false,
				}),
			);
		case "Kamuro":
			return times(
				count,
				baseRecipe(0.992, 0.32, one(kin), [160, 220], {
					speedScale: 0.8,
					fadeExp: 0.6,
					flicker: 0.12,
				}),
			);
		case "Senrin": {
			const childColor = rng.pick(pal);
			const child = (r: Rng): SplitSpec => ({
				count: r.randInt(8, 13),
				// 子星の drag は 0.96 固定。半径は画面高さの 5%
				speed: 0.05 * height * (1 - 0.96),
				size: 1,
				life: 22,
				colors: [childColor],
			});
			return times(
				count,
				baseRecipe(0.97, 0.1, single, [35, 45], { split: child }),
			);
		}
		case "ShinIri": {
			const core = s.corePalette ?? gin;
			const layers: ReadonlyArray<
				readonly [number, ReadonlyArray<Color>, number]
			> = s.triple
				? [
						[1, pal, 0.6],
						[0.6, core, 0.25],
						[0.32, gin, 0.15],
					]
				: [
						[1, pal, 0.7],
						[0.45, core, 0.3],
					];
			return layers.flatMap(([scale, colors, ratio]) =>
				times(
					roundHalfUp(count * ratio),
					baseRecipe(0.975, 0.08, one(colors), [75, 105], {
						speedScale: scale,
					}),
				),
			);
		}
		case "IroHenka": {
			const from = pal[0] ?? white;
			const to = pal[1] ?? from;
			return times(
				count,
				baseRecipe(0.975, 0.08, () => [from, to], [70, 100]),
			);
		}
	}
};

/**
 * 3 次元の球面上の一様な点を平面に投影する。外周が密になり真球に見える。
 * 速さ speed で向きを決め、vx / vy に振り分ける
 */
const starVelocity = (rng: Rng, speed: number): readonly [number, number] => {
	const z = rng.rand(-1, 1);
	const theta = rng.rand(0, 2 * Math.PI);
	const radius = Math.sqrt(1 - z * z);
	return [Math.cos(theta) * radius * speed, Math.sin(theta) * radius * speed];
};
