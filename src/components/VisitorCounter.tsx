"use client";

import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
	getVisitorCount,
	incrementVisitorCount,
} from "@/app/actions/visitor-count";

function VisitorCount() {
	const [count, setCount] = useState<number | null>(null);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const data = await incrementVisitorCount();
				if (!cancelled) {
					setCount(data.count);
				}
			} catch (incrementError) {
				console.error("Failed to increment visitor count:", incrementError);
				try {
					const data = await getVisitorCount();
					if (!cancelled) {
						setCount(data.count);
					}
				} catch (fetchError) {
					console.error("Failed to fetch visitor count:", fetchError);
					if (!cancelled) {
						setError(
							fetchError instanceof Error
								? fetchError
								: new Error("Unknown error"),
						);
					}
				}
			}
		};

		load();

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
		<div className="flex items-center gap-2 text-xs text-white/50 select-none">
			<span className="uppercase tracking-wider">Visitors</span>
			<span className="text-white/80">{count.toLocaleString()}</span>
		</div>
	);
}

function LoadingFallback() {
	return (
		<div className="text-xs text-white/40 tracking-wider animate-pulse">
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
		<div className="flex items-center gap-2 text-xs text-white/40">
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
			<Suspense fallback={<LoadingFallback />}>
				<VisitorCount />
			</Suspense>
		</ErrorBoundary>
	);
}
