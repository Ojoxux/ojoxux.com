// 花火以外の純粋なロジック（旧 Ojoxux.Core.{Round,Birthday,CountUp,WakaTime}）

/**
 * JS の Math.round と同じ丸め（.5 は +∞ 方向）。
 * Haskell 版では偶数丸めを避けるために必要だった。TS では Math.round そのもの
 */
export const roundHalfUp = (x: number): number => Math.round(x);

/**
 * 誕生日モードかどうか。
 * localStorage の `birthday=1`、ビルド時の `VITE_BIRTHDAY_MODE=1`、当日が 8/18 のいずれかで有効になる。
 * 月は 1 始まり。
 */
export const resolveBirthdayMode = (
	storageFlag: boolean,
	envFlag: boolean,
	month: number,
	day: number,
): boolean => storageFlag || envFlag || (month === 8 && day === 18);

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

/** 言語ごとのバーを構成するブロック数 */
export const rowBlocks = 10;

/** パーセントをブロック数に変換する。結果は 0..rowBlocks に収める */
export const filledBlocks = (percent: number): number =>
	Math.max(0, Math.min(rowBlocks, roundHalfUp((percent / 100) * rowBlocks)));
