"use server";

import { Effect } from "effect";
import { incrementVisitorCountInD1 } from "@/lib/d1";

export interface VisitorCountResult {
	count: number;
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

	return Effect.runPromise(
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
