import { describe, expect, it } from "vitest";
import { roundHalfUp } from "./round-half-up.ts";

describe("roundHalfUp", () => {
	it("JS の Math.round と同じく .5 を切り上げる", () => {
		expect([2.5, 3.5, 1.25, 0].map(roundHalfUp)).toEqual([3, 4, 1, 0]);
	});
});
