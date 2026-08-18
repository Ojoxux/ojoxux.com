const BIRTHDAY_FLAG_KEY = "birthday";

const isBirthday = (date: Date): boolean =>
	date.getMonth() === 7 && date.getDate() === 18;

const hasBirthdayFlag = (): boolean => {
	try {
		return localStorage.getItem(BIRTHDAY_FLAG_KEY) === "1";
	} catch {
		return false;
	}
};

export const resolveBirthdayMode = (date: Date): boolean => {
	if (hasBirthdayFlag()) return true;
	if (process.env.NEXT_PUBLIC_BIRTHDAY_MODE === "1") return true;
	return isBirthday(date);
};
