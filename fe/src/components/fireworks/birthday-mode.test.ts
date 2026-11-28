import { describe, expect, it } from "vitest";
import { resolveBirthdayMode } from "./birthday-mode.ts";

describe("resolveBirthdayMode", () => {
	it("8/18 は誕生日", () =>
		expect(resolveBirthdayMode(false, false, 8, 18)).toBe(true));
	it("それ以外の日は誕生日ではない", () =>
		expect(resolveBirthdayMode(false, false, 8, 17)).toBe(false));
	it("8 月以外の 18 日は誕生日ではない", () =>
		expect(resolveBirthdayMode(false, false, 7, 18)).toBe(false));
	it("localStorage のフラグがあれば常に誕生日", () =>
		expect(resolveBirthdayMode(true, false, 1, 1)).toBe(true));
	it("ビルド時のフラグがあれば常に誕生日", () =>
		expect(resolveBirthdayMode(false, true, 1, 1)).toBe(true));
});
