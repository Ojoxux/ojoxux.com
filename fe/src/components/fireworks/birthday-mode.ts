/**
 * 誕生日モードかどうか。
 * localStorage の `birthday=1`、ビルド時の `VITE_BIRTHDAY_MODE=1`、当日が 8/18 のいずれかで有効になる。
 * 月は 1 始まり。
 */
export const resolveBirthdayMode = (
	storageFlag: boolean,
	envFlag: boolean,
	month: number,
	day: number,
): boolean => storageFlag || envFlag || (month === 8 && day === 18);
