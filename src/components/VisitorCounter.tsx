"use client";

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
		<div className="flex flex-col items-center gap-3 select-none">
			<div className="text-4xl font-bold text-white">
				<CountUp to={count} duration={1} separator="," />
			</div>
			<span className="text-xs font-semibold tracking-widest text-white/50">
				VISITS
			</span>
		</div>
	);
}

function LoadingFallback() {
	return (
		<div className="text-sm text-white/40 tracking-wider animate-pulse">
			LOADING...
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
		<div className="flex items-center gap-2 text-sm text-white/40">
			<span>ERROR</span>
			<button
				type="button"
				onClick={resetErrorBoundary}
				className="underline hover:text-white/70 transition-colors"
			>
				RETRY
			</button>
		</div>
	);
}

export default function VisitorCounter() {
	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<VisitorCount />
		</ErrorBoundary>
	);
}
