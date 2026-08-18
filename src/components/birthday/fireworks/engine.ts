import { drawParticle, updateParticle } from "./particle";
import { buildProgram } from "./program";
import { rand, randInt } from "./random";
import { explodeShell } from "./shells";
import type { Cue, Particle, Shell } from "./types";

const STEP_MS = 1000 / 60;
const MAX_DT = 100;
const MAX_STEPS = 3;
const FADE_ALPHA = 0.09;
const PARTICLE_CAP = 12000;
const DRAIN_STEPS = 120;

export interface ShowHandle {
	stop(): void;
	resize(width: number, height: number): void;
}

// splice より速いが、配列の順序は保たれない
function swapRemove<T>(items: T[], index: number): void {
	const last = items.pop();
	if (last !== undefined && index < items.length) {
		items[index] = last;
	}
}

export function startShow(
	trailCtx: CanvasRenderingContext2D,
	sharpCtx: CanvasRenderingContext2D,
	width: number,
	height: number,
	onComplete?: () => void,
): ShowHandle {
	let w = width;
	let h = height;
	const cues: Cue[] = buildProgram();
	const fired: boolean[] = new Array<boolean>(cues.length).fill(false);
	let firedCount = 0;
	const shells: Shell[] = [];
	const particles: Particle[] = [];

	let elapsed = 0;
	let accumulator = 0;
	let last = performance.now();
	let frameId = 0;
	let stopped = false;
	let drain = 0;

	// riseSpeed は高さに対する比率かつ垂直成分なので、h が約分されて
	// 上昇時間がビューポートの高さに依存しない
	const launchAtFor = (item: Cue): number => {
		const riseMs = ((1 - item.burstYRatio) / item.riseSpeed) * STEP_MS;
		return Math.max(0, item.at - riseMs);
	};

	const launchShell = (item: Cue): void => {
		const riseSpeed = item.riseSpeed * h;
		shells.push({
			x: item.xRatio * w,
			y: h,
			vx: rand(-0.15, 0.15) * riseSpeed,
			riseSpeed,
			burstY: item.burstYRatio * h,
			spec: item.shell,
			color: item.shell.palette[0] ?? "#ffffff",
		});
	};

	const burst = (shell: Shell): void => {
		for (const star of explodeShell(shell.spec, shell.x, shell.y, h)) {
			particles.push(star);
		}
		// 上限超過分は配列の先頭から一括除去する。swapRemove により配列は
		// 厳密な生成順ではないが、概ね古い星から消える近似として機能する
		const overflow = particles.length - PARTICLE_CAP;
		if (overflow > 0) {
			particles.splice(0, overflow);
		}
	};

	const spawnSplit = (parent: Particle): void => {
		const spec = parent.split;
		if (!spec) return;
		for (let i = 0; i < spec.count; i++) {
			const angle = rand(0, Math.PI * 2);
			const speed = spec.speed * rand(0.5, 1);
			particles.push({
				x: parent.x,
				y: parent.y,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				size: spec.size,
				drag: 0.96,
				gravity: 0.045,
				life: spec.life,
				maxLife: spec.life,
				colorStops: spec.colorStops,
				flicker: 0,
				trail: false,
				fadeExp: 1.4,
			});
		}
	};

	const stepPhysics = (): void => {
		elapsed += STEP_MS;

		// cues は at 順だが launchAt 順とは限らないため、break せず全件走査する
		for (let i = 0; i < cues.length; i++) {
			if (fired[i]) continue;
			const item = cues[i];
			if (!item || launchAtFor(item) > elapsed) continue;
			launchShell(item);
			fired[i] = true;
			firedCount++;
		}

		for (let i = shells.length - 1; i >= 0; i--) {
			const shell = shells[i];
			if (!shell) continue;
			shell.x += shell.vx;
			shell.y -= shell.riseSpeed;
			// 曲導の火の粉
			const sparks = randInt(1, 3);
			for (let s = 0; s < sparks; s++) {
				particles.push({
					x: shell.x,
					y: shell.y,
					vx: rand(-0.001, 0.001) * h,
					vy: rand(0.0007, 0.0027) * h,
					size: 1,
					drag: 0.94,
					gravity: 0.00007 * h,
					life: 18,
					maxLife: 18,
					colorStops: [shell.color],
					flicker: 0.25,
					trail: true,
					fadeExp: 1.2,
				});
			}
			if (shell.y <= shell.burstY) {
				burst(shell);
				swapRemove(shells, i);
			}
		}

		// 後方から走査するので、swapRemove と spawnSplit による末尾への追加は
		// このループ内で再訪されない
		for (let i = particles.length - 1; i >= 0; i--) {
			const particle = particles[i];
			if (!particle) continue;
			updateParticle(particle);
			if (particle.life > 0) continue;
			if (particle.split) spawnSplit(particle);
			swapRemove(particles, i);
		}
	};

	const fadeTrail = (): void => {
		trailCtx.globalCompositeOperation = "destination-out";
		trailCtx.globalAlpha = 1;
		trailCtx.fillStyle = `rgba(0, 0, 0, ${FADE_ALPHA})`;
		trailCtx.fillRect(0, 0, w, h);
		trailCtx.globalCompositeOperation = "lighter";
	};

	const render = (): void => {
		sharpCtx.clearRect(0, 0, w, h);
		for (const particle of particles) {
			drawParticle(particle.trail ? trailCtx : sharpCtx, particle);
		}
		trailCtx.globalAlpha = 1;
		sharpCtx.globalAlpha = 1;
	};

	const frame = (now: number): void => {
		if (stopped) return;
		const dt = Math.min(now - last, MAX_DT);
		last = now;
		accumulator += dt;

		let steps = 0;
		while (accumulator >= STEP_MS && steps < MAX_STEPS) {
			// 残光の減衰は物理ステップと同じ回数だけ適用し、
			// コマ落ちしても尾の長さが変わらないようにする
			fadeTrail();
			stepPhysics();
			accumulator -= STEP_MS;
			steps++;
		}
		if (steps === MAX_STEPS) accumulator = 0;

		render();

		// 最後の星が消えても残光は残っているので、拭い切ってから止める
		const idle =
			firedCount === cues.length &&
			shells.length === 0 &&
			particles.length === 0;
		drain = idle ? drain + steps : 0;
		if (drain >= DRAIN_STEPS) {
			stopped = true;
			trailCtx.clearRect(0, 0, w, h);
			sharpCtx.clearRect(0, 0, w, h);
			onComplete?.();
			return;
		}
		frameId = requestAnimationFrame(frame);
	};

	frameId = requestAnimationFrame(frame);

	return {
		stop(): void {
			stopped = true;
			cancelAnimationFrame(frameId);
		},
		resize(nextWidth: number, nextHeight: number): void {
			if (nextWidth <= 0 || nextHeight <= 0) return;
			const scaleX = nextWidth / w;
			const scaleY = nextHeight / h;
			for (const particle of particles) {
				particle.x *= scaleX;
				particle.y *= scaleY;
			}
			for (const shell of shells) {
				shell.x *= scaleX;
				shell.y *= scaleY;
				shell.burstY *= scaleY;
				shell.vx *= scaleX;
				shell.riseSpeed *= scaleY;
			}
			w = nextWidth;
			h = nextHeight;
			// canvas の width/height 代入で合成モードがリセットされるため再設定する
			trailCtx.globalCompositeOperation = "lighter";
			sharpCtx.globalCompositeOperation = "lighter";
		},
	};
}
