import { describe, expect, it } from "vitest";
import { filledBlocks, rowBlocks } from "./activity-blocks.ts";

describe("filledBlocks", () => {
	it("1 行は 10 ブロック", () => expect(rowBlocks).toBe(10));
	it("パーセントをブロック数に丸める（.5 は切り上げ）", () => {
		expect([0, 12.5, 25, 75, 100].map(filledBlocks)).toEqual([0, 1, 3, 8, 10]);
	});
	it("0..rowBlocks の範囲に収める", () => {
		expect(filledBlocks(150)).toBe(10);
		expect(filledBlocks(-5)).toBe(0);
	});
});
