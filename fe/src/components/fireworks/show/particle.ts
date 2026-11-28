// 星（粒子）の 1 ステップ分の更新と色
import { white } from "./palette.ts";
import type { Color, Particle } from "./types.ts";

/** 色変わりで 2 色目に切り替わる寿命の割合 */
const colorSwitch = 0.45;

/** 粒子をその場で 1 ステップ進める */
export const updateParticle = (p: Particle): void => {
	p.vx *= p.drag;
	p.vy = p.vy * p.drag + p.gravity;
	p.x += p.vx;
	p.y += p.vy;
	p.life -= 1;
};

export const particleColor = (p: Particle): Color => {
	const stops = p.colorStops;
	if (stops.length === 0) return white;
	if (stops.length === 1) return stops[0] as Color;
	const progress = 1 - p.life / p.maxLife;
	return (progress < colorSwitch ? stops[0] : stops[1]) as Color;
};
