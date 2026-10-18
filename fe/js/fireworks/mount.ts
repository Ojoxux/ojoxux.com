import { startShow } from "./engine";

// 実サイズの 1/3 で保持し、CSS で拡大してドット感を出す
const PIXEL_SCALE = 3;

export function prefersReducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// container の中に canvas を 2 枚作ってショーを始める。
// 開始できなかったとき（reduced-motion、サイズ 0、2D コンテキスト無し）は undefined を返す。
export function mountFireworks(
	container: HTMLElement,
): (() => void) | undefined {
	if (prefersReducedMotion()) {
		return undefined;
	}
	if (container.offsetWidth === 0 || container.offsetHeight === 0) {
		return undefined;
	}

	const trail = document.createElement("canvas");
	const sharp = document.createElement("canvas");
	const trailCtx = trail.getContext("2d");
	const sharpCtx = sharp.getContext("2d");
	if (!trailCtx || !sharpCtx) {
		return undefined;
	}
	container.append(trail, sharp);

	const measure = (): { width: number; height: number } => ({
		width: Math.max(1, Math.ceil(container.offsetWidth / PIXEL_SCALE)),
		height: Math.max(1, Math.ceil(container.offsetHeight / PIXEL_SCALE)),
	});

	const initial = measure();
	for (const canvas of [trail, sharp]) {
		canvas.width = initial.width;
		canvas.height = initial.height;
	}
	trailCtx.globalCompositeOperation = "lighter";
	sharpCtx.globalCompositeOperation = "lighter";

	const show = startShow(trailCtx, sharpCtx, initial.width, initial.height);

	const handleResize = (): void => {
		const next = measure();
		for (const canvas of [trail, sharp]) {
			canvas.width = next.width;
			canvas.height = next.height;
		}
		show.resize(next.width, next.height);
	};
	window.addEventListener("resize", handleResize);

	return () => {
		window.removeEventListener("resize", handleResize);
		show.stop();
		trail.remove();
		sharp.remove();
	};
}
