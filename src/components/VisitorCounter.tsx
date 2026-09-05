"use client";

import * as stylex from "@stylexjs/stylex";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { incrementVisitorCount } from "@/app/actions/visitor-count";
import CountUp from "./CountUp";

function VisitorCount() {
	const [count, setCount] = useState<number | null>(null);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let cancelled = false;

		incrementVisitorCount()
			.then((data) => {
				if (!cancelled) {
					setCount(data.count);
				}
			})
			.catch((fetchError) => {
				console.error("Failed to increment visitor count:", fetchError);
				if (!cancelled) {
					setError(
						fetchError instanceof Error
							? fetchError
							: new Error("Unknown error"),
					);
				}
			});

		return () => {
			cancelled = true;
		};
	}, []);

	if (error) {
		throw error;
	}

	if (count === null) {
		return <LoadingFallback />;
	}

	return (
		<div {...stylex.props(styles.row, styles.countRow)}>
			<Eye {...stylex.props(styles.eye)} aria-hidden="true" />
			<span {...stylex.props(styles.srOnly)}>Visits</span>
			<span {...stylex.props(styles.count)}>
				<CountUp to={count} duration={1} separator="," />
			</span>
		</div>
	);
}

function LoadingFallback() {
	return (
		<div {...stylex.props(styles.row)}>
			<Eye {...stylex.props(styles.eye)} aria-hidden="true" />
			<span {...stylex.props(styles.srOnly)}>Visits</span>
			<span {...stylex.props(styles.status, styles.loading)}>...</span>
		</div>
	);
}

function ErrorFallback({
	resetErrorBoundary,
}: {
	error: Error;
	resetErrorBoundary: () => void;
}) {
	return (
		<div {...stylex.props(styles.row)}>
			<Eye {...stylex.props(styles.eye)} aria-hidden="true" />
			<span {...stylex.props(styles.srOnly)}>Visits</span>
			<span {...stylex.props(styles.errorStatus)}>
				<span>Error</span>
				<button
					type="button"
					onClick={resetErrorBoundary}
					{...stylex.props(styles.retry)}
				>
					Retry
				</button>
			</span>
		</div>
	);
}

const pulse = stylex.keyframes({
	"50%": {
		opacity: 0.5,
	},
});

const styles = stylex.create({
	row: {
		display: "flex",
		alignItems: "center",
		gap: 8,
	},
	countRow: {
		userSelect: "none",
	},
	eye: {
		width: 24,
		height: 24,
		color: "rgba(255, 255, 255, 0.5)",
	},
	srOnly: {
		position: "absolute",
		width: 1,
		height: 1,
		padding: 0,
		margin: -1,
		overflow: "hidden",
		clip: "rect(0, 0, 0, 0)",
		whiteSpace: "nowrap",
		borderWidth: 0,
	},
	count: {
		fontSize: "1.5rem",
		lineHeight: "2rem",
		fontWeight: 700,
		color: "#fff",
	},
	status: {
		fontSize: "1.125rem",
		lineHeight: "1.75rem",
		color: "rgba(255, 255, 255, 0.4)",
	},
	loading: {
		animationName: pulse,
		animationDuration: "2s",
		animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
		animationIterationCount: "infinite",
	},
	errorStatus: {
		display: "flex",
		alignItems: "center",
		gap: 8,
		fontSize: "1.125rem",
		lineHeight: "1.75rem",
		color: "rgba(255, 255, 255, 0.4)",
	},
	retry: {
		padding: 0,
		borderWidth: 0,
		backgroundColor: "transparent",
		fontSize: "0.875rem",
		lineHeight: "1.25rem",
		color: {
			default: "inherit",
			":hover": "rgba(255, 255, 255, 0.7)",
		},
		textDecoration: "underline",
		transitionProperty: "color",
		transitionDuration: "150ms",
	},
});

export default function VisitorCounter() {
	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<VisitorCount />
		</ErrorBoundary>
	);
}
