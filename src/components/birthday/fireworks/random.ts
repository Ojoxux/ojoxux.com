export const rand = (min: number, max: number): number =>
	Math.random() * (max - min) + min;

export const randInt = (min: number, max: number): number =>
	Math.floor(rand(min, max));

export const pick = <T>(items: T[]): T => items[randInt(0, items.length)] as T;

export const NISHIKI: string[] = ["#ffd27a", "#ffb347", "#ffe6b0"];

export const KIN: string[] = ["#ffc24a", "#ffdca0"];

export const GIN: string[] = ["#e8f4ff", "#ffffff"];

export const SAISHIKI: string[] = [
	"#ff3b3b",
	"#3b9bff",
	"#3bff8f",
	"#c46bff",
	"#4ff0ff",
	"#ff5ed2",
];

export const IRO_HENKA_PAIRS: string[][] = [
	["#3bff8f", "#ff3b3b"],
	["#3b9bff", "#ffc24a"],
	["#c46bff", "#e8f4ff"],
	["#ff3b3b", "#3b9bff"],
];
