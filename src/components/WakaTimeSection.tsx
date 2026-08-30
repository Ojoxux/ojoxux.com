import { getWakaTimeActivity } from "@/lib/wakatime";
import WakaTimeActivity from "./WakaTimeActivity";

export default async function WakaTimeSection() {
	const activity = await getWakaTimeActivity();

	return <WakaTimeActivity activity={activity} />;
}
