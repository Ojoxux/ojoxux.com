/**
 * 花火エンジンの型。
 * 座標と速度は canvas（実サイズの 1/3）のピクセル単位、時間は 1/60 秒のステップ単位。
 * 粒子は毎フレーム数千個を更新するので、ミュータブルに扱う。
 */

/** `#rrggbb` 形式の色 */
export type Color = string;

/** 玉の種類（菊・牡丹・冠・千輪・芯入り・色変わり） */
export type Kind =
	| "Kiku"
	| "Botan"
	| "Kamuro"
	| "Senrin"
	| "ShinIri"
	| "IroHenka";

/** 玉の大きさ */
export type Grade = "Small" | "Medium" | "Large" | "XLarge";

export interface ShellSpec {
	readonly kind: Kind;
	readonly grade: Grade;
	readonly palette: ReadonlyArray<Color>;
	readonly corePalette: ReadonlyArray<Color> | null;
	readonly countScale: number;
	readonly lifeScale: number;
	readonly triple: boolean;
}

/** 省略可能な項目を既定値にした ShellSpec */
export const shellSpec = (
	kind: Kind,
	grade: Grade,
	palette: ReadonlyArray<Color>,
	overrides: Partial<Omit<ShellSpec, "kind" | "grade" | "palette">> = {},
): ShellSpec => ({
	kind,
	grade,
	palette,
	corePalette: null,
	countScale: 1,
	lifeScale: 1,
	triple: false,
	...overrides,
});

/** 演目の 1 発。at は破裂させたい時刻（ms）、比率は canvas の幅・高さに対する値 */
export interface Cue {
	readonly at: number;
	readonly shell: ShellSpec;
	readonly xRatio: number;
	readonly burstYRatio: number;
	readonly riseSpeed: number;
}

/** 千輪の子星 */
export interface SplitSpec {
	readonly count: number;
	readonly speed: number;
	readonly size: number;
	readonly life: number;
	readonly colors: ReadonlyArray<Color>;
}

export interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	drag: number;
	gravity: number;
	life: number;
	maxLife: number;
	colorStops: ReadonlyArray<Color>;
	flicker: number;
	trail: boolean;
	fadeExp: number;
	split: SplitSpec | null;
}

/** 上昇中の玉 */
export interface Shell {
	x: number;
	y: number;
	vx: number;
	riseSpeed: number;
	burstY: number;
	readonly spec: ShellSpec;
	readonly color: Color;
}
