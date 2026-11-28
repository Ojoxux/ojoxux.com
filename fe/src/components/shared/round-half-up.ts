/**
 * JS の Math.round と同じ丸め（.5 は +∞ 方向）。
 * Haskell 版では偶数丸めを避けるために必要だった。TS では Math.round そのもの
 */
export const roundHalfUp = (x: number): number => Math.round(x);
