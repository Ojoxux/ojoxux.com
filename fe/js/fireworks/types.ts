export interface SplitSpec {
	count: number;
	speed: number;
	size: number;
	life: number;
	colorStops: string[];
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
	colorStops: string[];
	flicker: number;
	trail: boolean;
	fadeExp: number;
	split?: SplitSpec;
}

export type ShellKind =
	| "kiku"
	| "botan"
	| "kamuro"
	| "senrin"
	| "shinIri"
	| "iroHenka";

export type ShellGrade = "small" | "medium" | "large" | "xlarge";

export interface ShellSpec {
	kind: ShellKind;
	grade: ShellGrade;
	palette: string[];
	corePalette?: string[];
	countScale?: number;
	lifeScale?: number;
	triple?: boolean;
}

export interface Cue {
	at: number;
	shell: ShellSpec;
	xRatio: number;
	burstYRatio: number;
	riseSpeed: number;
}

export interface Shell {
	x: number;
	y: number;
	vx: number;
	riseSpeed: number;
	burstY: number;
	spec: ShellSpec;
	color: string;
}
