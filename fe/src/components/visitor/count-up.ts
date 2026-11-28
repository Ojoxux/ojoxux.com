import { roundHalfUp } from "../shared/round-half-up.ts";

/** カウントアップにかける時間（ミリ秒） */
export const countDurationMs = 1000;

/** ease-out（3 次）。入力は 0..1 に丸める */
export const easeOutCubic = (t: number): number => {
	const clamped = Math.max(0, Math.min(1, t));
	return 1 - (1 - clamped) ** 3;
};

/** 開始からの経過ミリ秒に対する表示値 */
export const countValueAt = (target: number, elapsedMs: number): number =>
	roundHalfUp(target * easeOutCubic(elapsedMs / countDurationMs));

/** 3 桁ごとにカンマで区切る */
export const formatWithSeparator = (n: number): string => {
	const digits = Math.abs(Math.trunc(n))
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return n < 0 ? `-${digits}` : digits;
};
