"use client";

import { PartyPopper, Snowflake } from "lucide-react";
import { useEffect, useState } from "react";
import Fireworks from "./Fireworks";
import HatenaStar from "./HatenaStar";
import PixelSnow from "./PixelSnow";
import VisitorCounter from "./VisitorCounter";

const isBirthday = (date: Date): boolean =>
	date.getMonth() === 7 && date.getDate() === 18;

export default function HomeClient() {
	const [showSnow, setShowSnow] = useState(true);
	const [isBirthdayToday, setIsBirthdayToday] = useState(false);
	const [showFireworks, setShowFireworks] = useState(true);

	useEffect(() => {
		setIsBirthdayToday(isBirthday(new Date()));
	}, []);

	return (
		<div className="relative min-h-screen bg-black">
			{showSnow && (
				<PixelSnow
					color="#ffffff"
					flakeSize={0.012}
					minFlakeSize={1.3}
					pixelResolution={200}
					speed={1.25}
					depthFade={7}
					farPlane={15}
					brightness={1.5}
					gamma={0.4545}
					density={0.2}
					variant="round"
					direction={125}
				/>
			)}
			{isBirthdayToday && showFireworks && <Fireworks />}
			<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
				<div className="pointer-events-auto">
					<VisitorCounter />
				</div>
			</div>
			<div className="absolute top-4 right-4 flex items-center gap-2">
				<HatenaStar />
				{isBirthdayToday && (
					<button
						type="button"
						onClick={() => setShowFireworks(!showFireworks)}
						className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
						aria-label={showFireworks ? "花火を非表示" : "花火を表示"}
					>
						<PartyPopper
							className={`w-6 h-6 transition-colors ${showFireworks ? "text-white" : "text-white/40"}`}
						/>
					</button>
				)}
				<button
					type="button"
					onClick={() => setShowSnow(!showSnow)}
					className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
					aria-label={showSnow ? "雪を非表示" : "雪を表示"}
				>
					<Snowflake
						className={`w-6 h-6 transition-colors ${showSnow ? "text-white" : "text-white/40"}`}
					/>
				</button>
			</div>
		</div>
	);
}
