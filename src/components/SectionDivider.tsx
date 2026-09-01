import type { CSSProperties } from "react";

type SectionDividerProps = {
	className?: string;
	wavelength?: number;
	amplitude?: number;
	speed?: number;
	opacity?: number;
};

export default function SectionDivider({
	className = "",
	wavelength = 24,
	amplitude = 4,
	speed = 2,
	opacity = 0.15,
}: SectionDividerProps) {
	const height = amplitude * 2;
	const half = wavelength / 2;
	const quarter = wavelength / 4;
	const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${wavelength}' height='${height}' viewBox='0 0 ${wavelength} ${height}'><path d='M0 ${amplitude} Q ${quarter} 0 ${half} ${amplitude} T ${wavelength} ${amplitude}' fill='none' stroke='white' stroke-opacity='${opacity}' stroke-width='1.5'/></svg>`;

	const style = {
		height,
		backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
		backgroundSize: `${wavelength}px ${height}px`,
		animation: `wave-scroll ${speed}s linear infinite`,
		"--wave-length": `${wavelength}px`,
	} as CSSProperties;

	return (
		<div
			aria-hidden="true"
			className={`bg-repeat-x ${className}`}
			style={style}
		/>
	);
}
