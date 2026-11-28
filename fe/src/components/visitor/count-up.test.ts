import { describe, expect, it } from "vitest";
import { countValueAt, easeOutCubic, formatWithSeparator } from "./count-up.ts";

describe("easeOutCubic", () => {
	it("0 と 1 で端点を返す", () => {
		expect(easeOutCubic(0)).toBe(0);
		expect(easeOutCubic(1)).toBe(1);
	});
	it("範囲外の入力は 0..1 に丸める", () => {
		expect(easeOutCubic(-1)).toBe(0);
		expect(easeOutCubic(2)).toBe(1);
	});
});

describe("countValueAt", () => {
	it("開始時は 0", () => expect(countValueAt(1000, 0)).toBe(0));
	it("半分の時間で ease-out の 87.5%", () =>
		expect(countValueAt(1000, 500)).toBe(875));
	it("所要時間を過ぎたら目標値で止まる", () => {
		expect(countValueAt(1000, 1000)).toBe(1000);
		expect(countValueAt(1000, 5000)).toBe(1000);
	});
});

describe("formatWithSeparator", () => {
	it("3 桁ごとにカンマを入れる", () => {
		expect([0, 999, 1000, 1234567, -1234].map(formatWithSeparator)).toEqual([
			"0",
			"999",
			"1,000",
			"1,234,567",
			"-1,234",
		]);
	});
});
