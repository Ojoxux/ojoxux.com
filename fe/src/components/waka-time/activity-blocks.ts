import { roundHalfUp } from "../shared/round-half-up.ts";

/** 言語ごとのバーを構成するブロック数 */
export const rowBlocks = 10;

/** パーセントをブロック数に変換する。結果は 0..rowBlocks に収める */
export const filledBlocks = (percent: number): number =>
	Math.max(0, Math.min(rowBlocks, roundHalfUp((percent / 100) * rowBlocks)));
