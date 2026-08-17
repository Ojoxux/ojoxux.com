"use client";

import { useEffect, useRef } from "react";

interface NumberRange {
	min: number;
	max: number;
}

type SizeOrRange = number | NumberRange;

const rand = (min: number, max: number): number =>
	Math.random() * (max - min) + min;

const randInt = (min: number, max: number): number =>
	Math.floor(Math.random() * (max - min) + min);

const randColor = (): string => `hsl(${randInt(0, 360)}, 100%, 50%)`;

const valueFromRange = (range: SizeOrRange): number =>
	typeof range === "number" ? range : rand(range.min, range.max);

const pickColor = (color: string | string[] | undefined): string => {
	if (Array.isArray(color)) {
		return color[randInt(0, color.length)] ?? randColor();
	}
	return color ?? randColor();
};

interface Particle {
	x: number;
	y: number;
	color: string;
	vx: number;
	vy: number;
	alpha: number;
	decay: number;
	size: number;
}

function createParticle(
	x: number,
	y: number,
	color: string,
	speed: number,
	direction: number,
	size: number,
): Particle {
	return {
		x,
		y,
		color,
		vx: Math.cos(direction) * speed,
		vy: Math.sin(direction) * speed,
		alpha: 1,
		decay: rand(0.005, 0.02),
		size,
	};
}

function updateParticle(particle: Particle): void {
	particle.vx *= 0.98;
	particle.vy *= 0.98;
	particle.vy += 0.05;
	particle.x += particle.vx;
	particle.y += particle.vy;
	particle.alpha -= particle.decay;
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
	ctx.save();
	ctx.globalAlpha = particle.alpha;
	ctx.fillStyle = particle.color;
	ctx.fillRect(
		particle.x - particle.size,
		particle.y - particle.size,
		particle.size * 2,
		particle.size * 2,
	);
	ctx.restore();
}

interface Firework {
	x: number;
	y: number;
	targetY: number;
	color: string;
	size: number;
	vx: number;
	vy: number;
	trail: { x: number; y: number }[];
	trailLength: number;
}

function createFirework(
	x: number,
	y: number,
	targetY: number,
	color: string,
	speed: number,
	size: number,
): Firework {
	const angle = -Math.PI / 2 + rand(-0.3, 0.3);
	return {
		x,
		y,
		targetY,
		color,
		size,
		vx: Math.cos(angle) * speed,
		vy: Math.sin(angle) * speed,
		trail: [],
		trailLength: randInt(10, 25),
	};
}

function updateFirework(firework: Firework): boolean {
	firework.trail.push({ x: firework.x, y: firework.y });
	if (firework.trail.length > firework.trailLength) {
		firework.trail.shift();
	}
	firework.x += firework.vx;
	firework.y += firework.vy;
	firework.vy += 0.02;
	return firework.vy < 0 && firework.y > firework.targetY;
}

function explodeFirework(
	firework: Firework,
	particleSpeed: SizeOrRange,
	particleSize: SizeOrRange,
): Particle[] {
	const count = randInt(50, 150);
	const particles: Particle[] = [];
	for (let i = 0; i < count; i++) {
		particles.push(
			createParticle(
				firework.x,
				firework.y,
				firework.color,
				valueFromRange(particleSpeed),
				rand(0, Math.PI * 2),
				valueFromRange(particleSize),
			),
		);
	}
	return particles;
}

function drawFirework(ctx: CanvasRenderingContext2D, firework: Firework): void {
	ctx.save();
	ctx.fillStyle = firework.color;
	for (const point of firework.trail) {
		ctx.fillRect(
			point.x - firework.size / 2,
			point.y - firework.size / 2,
			firework.size,
			firework.size,
		);
	}
	ctx.fillRect(
		firework.x - firework.size / 2,
		firework.y - firework.size / 2,
		firework.size,
		firework.size,
	);
	ctx.restore();
}

interface FireworksProps {
	population?: number;
	color?: string | string[];
	fireworkSpeed?: SizeOrRange;
	fireworkSize?: SizeOrRange;
	particleSpeed?: SizeOrRange;
	particleSize?: SizeOrRange;
	className?: string;
}

export default function Fireworks({
	population = 1,
	color,
	fireworkSpeed = { min: 4, max: 8 },
	fireworkSize = { min: 2, max: 5 },
	particleSpeed = { min: 2, max: 7 },
	particleSize = { min: 1, max: 5 },
	className = "",
}: FireworksProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;
		if (!container || !canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let width = container.offsetWidth;
		let height = container.offsetHeight;
		canvas.width = width;
		canvas.height = height;

		const handleResize = () => {
			width = container.offsetWidth;
			height = container.offsetHeight;
			canvas.width = width;
			canvas.height = height;
		};
		window.addEventListener("resize", handleResize);

		const fireworks: Firework[] = [];
		const particles: Particle[] = [];
		let launchTimeoutId: number | undefined;

		const launch = () => {
			const x = rand(width * 0.1, width * 0.9);
			const targetY = rand(height * 0.1, height * 0.4);
			fireworks.push(
				createFirework(
					x,
					height,
					targetY,
					pickColor(color),
					valueFromRange(fireworkSpeed),
					valueFromRange(fireworkSize),
				),
			);
			launchTimeoutId = window.setTimeout(launch, rand(300, 800) / population);
		};
		launch();

		let animationFrameId: number;
		const animate = () => {
			ctx.clearRect(0, 0, width, height);

			for (let i = fireworks.length - 1; i >= 0; i--) {
				const firework = fireworks[i];
				if (!firework) continue;
				if (updateFirework(firework)) {
					drawFirework(ctx, firework);
				} else {
					particles.push(
						...explodeFirework(firework, particleSpeed, particleSize),
					);
					fireworks.splice(i, 1);
				}
			}

			for (let i = particles.length - 1; i >= 0; i--) {
				const particle = particles[i];
				if (!particle) continue;
				updateParticle(particle);
				if (particle.alpha > 0) {
					drawParticle(ctx, particle);
				} else {
					particles.splice(i, 1);
				}
			}

			animationFrameId = requestAnimationFrame(animate);
		};
		animate();

		return () => {
			window.removeEventListener("resize", handleResize);
			if (launchTimeoutId !== undefined) {
				window.clearTimeout(launchTimeoutId);
			}
			cancelAnimationFrame(animationFrameId);
		};
	}, [
		population,
		color,
		fireworkSpeed,
		fireworkSize,
		particleSpeed,
		particleSize,
	]);

	return (
		<div
			ref={containerRef}
			className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
		>
			<canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
		</div>
	);
}
