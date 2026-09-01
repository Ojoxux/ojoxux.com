type SectionDividerProps = {
	className?: string;
};

const WAVE_PATTERN =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='8' viewBox='0 0 24 8'%3E%3Cpath d='M0 4 Q 6 0 12 4 T 24 4' fill='none' stroke='white' stroke-opacity='0.15' stroke-width='1.5'/%3E%3C/svg%3E\")";

export default function SectionDivider({
	className = "",
}: SectionDividerProps) {
	return (
		<div
			aria-hidden="true"
			className={`h-2 animate-wave-scroll bg-repeat-x ${className}`}
			style={{
				backgroundImage: WAVE_PATTERN,
				backgroundSize: "24px 8px",
			}}
		/>
	);
}
