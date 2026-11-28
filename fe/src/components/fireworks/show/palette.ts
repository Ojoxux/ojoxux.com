import type { Color } from "./types.ts";

/** 錦（暖色の金） */
export const nishiki: ReadonlyArray<Color> = ["#ffd27a", "#ffb347", "#ffe6b0"];

/** 金 */
export const kin: ReadonlyArray<Color> = ["#ffc24a", "#ffdca0"];

/** 銀 */
export const gin: ReadonlyArray<Color> = ["#e8f4ff", "#ffffff"];

/** 彩色 */
export const saishiki: ReadonlyArray<Color> = [
	"#ff3b3b",
	"#3b9bff",
	"#3bff8f",
	"#c46bff",
	"#4ff0ff",
	"#ff5ed2",
];

/** 色変わりの組み合わせ（変化前, 変化後） */
export const iroHenkaPairs: ReadonlyArray<ReadonlyArray<Color>> = [
	["#3bff8f", "#ff3b3b"],
	["#3b9bff", "#ffc24a"],
	["#c46bff", "#e8f4ff"],
	["#ff3b3b", "#3b9bff"],
];

export const white: Color = "#ffffff";
