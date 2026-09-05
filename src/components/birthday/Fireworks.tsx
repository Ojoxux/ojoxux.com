"use client";

import * as stylex from "@stylexjs/stylex";
import { useEffect, useRef } from "react";
import { startShow } from "./fireworks/engine";

// 実サイズの 1/3 で保持し、CSS で拡大してドット感を出す
const PIXEL_SCALE = 3;

interface FireworksProps {
	onComplete?: () => void;
}

export default function Fireworks({ onComplete }: FireworksProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const trailRef = useRef<HTMLCanvasElement>(null);
	const sharpRef = useRef<HTMLCanvasElement>(null);
	const onCompleteRef = useRef(onComplete);
	onCompleteRef.current = onComplete;

	// 依存配列は空。ショーは 1 回きりの再生なので props の変化で再起動させない
	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const container = containerRef.current;
		const trail = trailRef.current;
		const sharp = sharpRef.current;
		if (!container || !trail || !sharp) return;
		if (container.offsetWidth === 0 || container.offsetHeight === 0) return;

		const trailCtx = trail.getContext("2d");
		const sharpCtx = sharp.getContext("2d");
		if (!trailCtx || !sharpCtx) return;

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

		const show = startShow(
			trailCtx,
			sharpCtx,
			initial.width,
			initial.height,
			() => onCompleteRef.current?.(),
		);

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
		};
	}, []);

	return (
		<div ref={containerRef} {...stylex.props(styles.container)}>
			<canvas ref={trailRef} {...stylex.props(styles.canvas)} />
			<canvas ref={sharpRef} {...stylex.props(styles.canvas)} />
		</div>
	);
}

const styles = stylex.create({
	container: {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		width: "100%",
		height: "100%",
		pointerEvents: "none",
	},
	canvas: {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		width: "100%",
		height: "100%",
		imageRendering: "pixelated",
	},
});
