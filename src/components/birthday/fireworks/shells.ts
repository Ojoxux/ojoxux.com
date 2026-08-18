import { GIN, KIN, pick, rand, randInt } from "./random";
import type { Particle, ShellGrade, ShellSpec, SplitSpec } from "./types";

interface GradeParams {
	count: number;
	// canvas 高さに対する比率。解像度非依存にするため
	radiusMin: number;
	radiusMax: number;
	lifeScale: number;
}

// 星数は半径とセットで決める。星が 1 粒ずつ判別できるには外周で 3〜4px
// 程度の間隔が要るので、上限はおおよそ 2πr / 3.5 になる。
// 半径だけ変えて星数を据え置くと、密集したときに塊へ潰れて玉の形が読めなくなる
export const GRADE_TABLE: Record<ShellGrade, GradeParams> = {
	small: { count: 38, radiusMin: 0.065, radiusMax: 0.1, lifeScale: 0.85 },
	medium: { count: 65, radiusMin: 0.105, radiusMax: 0.16, lifeScale: 1.0 },
	large: { count: 118, radiusMin: 0.19, radiusMax: 0.25, lifeScale: 1.15 },
	xlarge: { count: 160, radiusMin: 0.26, radiusMax: 0.32, lifeScale: 1.5 },
};

interface StarOptions {
	x: number;
	y: number;
	speed: number;
	colorStops: string[];
	size: number;
	drag: number;
	gravity: number;
	life: number;
	fadeExp: number;
	trail: boolean;
	flicker?: number;
	split?: SplitSpec;
}

function makeStar(options: StarOptions): Particle {
	// 3 次元の球面上の一様な点を平面に投影する。外周が密になり真球に見える
	const z = rand(-1, 1);
	const theta = rand(0, Math.PI * 2);
	const radius = Math.sqrt(1 - z * z);
	return {
		x: options.x,
		y: options.y,
		vx: Math.cos(theta) * radius * options.speed,
		vy: Math.sin(theta) * radius * options.speed,
		size: options.size,
		drag: options.drag,
		gravity: options.gravity,
		life: options.life,
		maxLife: options.life,
		colorStops: options.colorStops,
		flicker: options.flicker ?? 0,
		trail: options.trail,
		fadeExp: options.fadeExp,
		split: options.split,
	};
}

interface CoreLayer {
	scale: number;
	colors: string[];
	ratio: number;
}

export function explodeShell(
	spec: ShellSpec,
	x: number,
	y: number,
	height: number,
): Particle[] {
	const grade = GRADE_TABLE[spec.grade];
	const count = Math.round(grade.count * (spec.countScale ?? 1));
	const lifeScale = grade.lifeScale * (spec.lifeScale ?? 1);
	const life = (min: number, max: number): number =>
		Math.round(rand(min, max) * lifeScale);

	// 半径は 1 発につき 1 回だけ決める。星ごとに引き直すと 1 発の中に
	// 大小の半径が混ざり、球殻ではなく塗り潰した円盤になって輪郭が丸く出ない
	const shellRadius = rand(grade.radiusMin, grade.radiusMax);

	// 指数減衰する星の到達距離は 初速 / (1 - drag)。目標半径から逆算する
	const speedFor = (drag: number, scale = 1): number =>
		shellRadius * rand(0.96, 1.04) * height * scale * (1 - drag);

	// 終端落下速度 gravity / (1 - drag) を「1 秒で画面高さの何割落ちるか」で指定する
	const gravityFor = (drag: number, fallPerSecond: number): number =>
		((fallPerSecond * height) / 60) * (1 - drag);

	const stars: Particle[] = [];

	switch (spec.kind) {
		case "kiku": {
			for (let i = 0; i < count; i++) {
				stars.push(
					makeStar({
						x,
						y,
						speed: speedFor(0.975),
						colorStops: [pick(spec.palette)],
						size: randInt(1, 3),
						drag: 0.975,
						gravity: gravityFor(0.975, 0.08),
						life: life(70, 100),
						fadeExp: 1.0,
						trail: true,
					}),
				);
			}
			break;
		}
		case "botan": {
			for (let i = 0; i < count; i++) {
				stars.push(
					makeStar({
						x,
						y,
						speed: speedFor(0.965),
						colorStops: [pick(spec.palette)],
						size: randInt(1, 3),
						drag: 0.965,
						gravity: gravityFor(0.965, 0.11),
						life: life(40, 60),
						fadeExp: 1.6,
						trail: false,
					}),
				);
			}
			break;
		}
		case "kamuro": {
			for (let i = 0; i < count; i++) {
				stars.push(
					makeStar({
						x,
						y,
						speed: speedFor(0.992, 0.8),
						colorStops: [pick(KIN)],
						size: randInt(1, 3),
						drag: 0.992,
						gravity: gravityFor(0.992, 0.32),
						life: life(160, 220),
						fadeExp: 0.6,
						trail: true,
						flicker: 0.12,
					}),
				);
			}
			break;
		}
		case "senrin": {
			const childColor = pick(spec.palette);
			for (let i = 0; i < count; i++) {
				stars.push(
					makeStar({
						x,
						y,
						speed: speedFor(0.97),
						colorStops: [pick(spec.palette)],
						size: randInt(1, 3),
						drag: 0.97,
						gravity: gravityFor(0.97, 0.1),
						life: life(35, 45),
						fadeExp: 1.0,
						trail: true,
						split: {
							count: randInt(8, 13),
							// 子星の drag は engine 側の 0.96 固定。半径は画面高さの 5%
							speed: 0.05 * height * (1 - 0.96),
							size: 1,
							life: 22,
							colorStops: [childColor],
						},
					}),
				);
			}
			break;
		}
		case "shinIri": {
			const corePalette = spec.corePalette ?? GIN;
			const layers: CoreLayer[] = spec.triple
				? [
						{ scale: 1, colors: spec.palette, ratio: 0.6 },
						{ scale: 0.6, colors: corePalette, ratio: 0.25 },
						{ scale: 0.32, colors: GIN, ratio: 0.15 },
					]
				: [
						{ scale: 1, colors: spec.palette, ratio: 0.7 },
						{ scale: 0.45, colors: corePalette, ratio: 0.3 },
					];
			for (const layer of layers) {
				const layerCount = Math.round(count * layer.ratio);
				for (let i = 0; i < layerCount; i++) {
					stars.push(
						makeStar({
							x,
							y,
							speed: speedFor(0.975, layer.scale),
							colorStops: [pick(layer.colors)],
							size: randInt(1, 3),
							drag: 0.975,
							gravity: gravityFor(0.975, 0.08),
							life: life(75, 105),
							fadeExp: 1.0,
							trail: true,
						}),
					);
				}
			}
			break;
		}
		case "iroHenka": {
			const from = spec.palette[0] ?? "#ffffff";
			const to = spec.palette[1] ?? from;
			for (let i = 0; i < count; i++) {
				stars.push(
					makeStar({
						x,
						y,
						speed: speedFor(0.975),
						colorStops: [from, to],
						size: randInt(1, 3),
						drag: 0.975,
						gravity: gravityFor(0.975, 0.08),
						life: life(70, 100),
						fadeExp: 1.0,
						trail: true,
					}),
				);
			}
			break;
		}
	}

	return stars;
}
