"use server";

import { Effect } from "effect";
import { getVisitorCountFromD1, incrementVisitorCountInD1 } from "@/lib/d1";

export interface VisitorCountResult {
	count: number;
}

function runEffect<T>(effect: Effect.Effect<T, Error>): Promise<T> {
	return Effect.runPromise(effect);
}

export async function getVisitorCount(): Promise<VisitorCountResult> {
	const effect = Effect.tryPromise({
		try: async () => {
			const count = await getVisitorCountFromD1();
			return { count };
		},
		catch: (error) =>
			error instanceof Error
				? error
				: new Error("Failed to fetch visitor count"),
	});

	return runEffect(
		effect.pipe(
			Effect.tapError((error) =>
				Effect.sync(() => {
					console.error("Error fetching visitor count:", error);
				}),
			),
			Effect.catchAll(() => Effect.succeed({ count: 0 })),
		),
	);
}

export async function incrementVisitorCount(): Promise<VisitorCountResult> {
	const effect = Effect.tryPromise({
		try: async () => {
			const count = await incrementVisitorCountInD1();
			return { count };
		},
		catch: (error) =>
			error instanceof Error
				? error
				: new Error("Failed to increment visitor count"),
	});

	return runEffect(
		effect.pipe(
			Effect.tapError((error) =>
				Effect.sync(() => {
					console.error("Error incrementing visitor count:", error);
				}),
			),
			Effect.catchAll(() => Effect.succeed({ count: 1 })),
		),
	);
}
