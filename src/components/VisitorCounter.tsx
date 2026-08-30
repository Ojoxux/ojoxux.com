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
		<div className="flex flex-col gap-1 select-none">
			<span className="text-sm font-semibold tracking-wide text-white/60">
				Visits
			</span>
			<span className="text-xl text-white/90">
				<CountUp to={count} duration={1} separator="," />
			</span>
		</div>
	);
}

function LoadingFallback() {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm font-semibold tracking-wide text-white/60">
				Visits
			</span>
			<span className="text-xl text-white/40 animate-pulse">...</span>
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
		<div className="flex flex-col gap-1">
			<span className="text-sm font-semibold tracking-wide text-white/60">
				Visits
			</span>
			<span className="flex items-center gap-2 text-xl text-white/40">
				<span>Error</span>
				<button
					type="button"
					onClick={resetErrorBoundary}
					className="text-sm underline hover:text-white/70 transition-colors"
				>
					Retry
				</button>
			</span>
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
