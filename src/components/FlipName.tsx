"use client";

import * as stylex from "@stylexjs/stylex";
import { motion, useReducedMotion } from "motion/react";

interface FlipNameProps {
	front: string;
	back: string;
}

export default function FlipName({ front, back }: FlipNameProps) {
	const reduce = useReducedMotion();

	const flip = reduce
		? { duration: 0 }
		: { duration: 0.5, ease: "easeInOut" as const };
	// easeInOut は t=0.25 で進捗50%（＝ちょうど90度）になるので、
	// そこを中心に入れ替えて前の文字が見えないようにする
	const fade = reduce
		? { duration: 0 }
		: { duration: 0.1, delay: 0.2, ease: "linear" as const };

	return (
		<motion.span
			{...stylex.props(styles.scene)}
			initial="rest"
			animate="rest"
			whileHover="hover"
		>
			<motion.span
				{...stylex.props(styles.inner)}
				variants={{ rest: { rotateX: 0 }, hover: { rotateX: -180 } }}
				transition={flip}
			>
				<motion.span
					{...stylex.props(styles.face)}
					variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }}
					transition={fade}
				>
					{front}
				</motion.span>
				<motion.span
					{...stylex.props(styles.face)}
					style={{ rotateX: 180 }}
					variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
					transition={fade}
					aria-hidden="true"
				>
					{back}
				</motion.span>
			</motion.span>
		</motion.span>
	);
}

const styles = stylex.create({
	scene: {
		display: "inline-block",
		perspective: "600px",
		verticalAlign: "top",
	},
	inner: {
		display: "inline-grid",
		transformStyle: "preserve-3d",
		// 回転する要素をヒットテストから外す。これが無いと、回転で潰れた
		// 当たり判定がポインタから外れて hover が解除され、振動ループになる
		pointerEvents: "none",
	},
	face: {
		gridArea: "1 / 1",
		whiteSpace: "nowrap",
	},
});
