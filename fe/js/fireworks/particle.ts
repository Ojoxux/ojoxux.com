import type { Particle } from "./types";

const COLOR_SWITCH = 0.45;

export function particleColor(particle: Particle): string {
	const first = particle.colorStops[0] ?? "#ffffff";
	const second = particle.colorStops[1];
	if (second === undefined) return first;
	const progress = 1 - particle.life / particle.maxLife;
	return progress < COLOR_SWITCH ? first : second;
}

export function updateParticle(particle: Particle): void {
	particle.vx *= particle.drag;
	particle.vy *= particle.drag;
	particle.vy += particle.gravity;
	particle.x += particle.vx;
	particle.y += particle.vy;
	particle.life -= 1;
}

export function drawParticle(
	ctx: CanvasRenderingContext2D,
	particle: Particle,
): void {
	if (particle.flicker > 0 && Math.random() < particle.flicker) return;
	const ratio = particle.life / particle.maxLife;
	ctx.globalAlpha = ratio ** particle.fadeExp;
	ctx.fillStyle = particleColor(particle);
	ctx.fillRect(
		Math.round(particle.x),
		Math.round(particle.y),
		particle.size,
		particle.size,
	);
}
