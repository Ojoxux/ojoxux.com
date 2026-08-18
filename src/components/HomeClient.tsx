"use client";

import Link from "next/link";
import { PartyPopper, Snowflake } from "pixelarticons/react";
import { useEffect, useState } from "react";
import Fireworks from "./Fireworks";
import HatenaStar from "./HatenaStar";
import PixelSnow from "./PixelSnow";
import VisitorCounter from "./VisitorCounter";

// 角を落として硬いオフセット影を付け、押すと影の分だけ沈むドット調ボタン。
// 影の色はカウンターの drop-shadow と同じ #4b5563 に合わせている。
const pixelButtonClass =
	"p-1.5 bg-white/10 hover:bg-white/20 rounded-none border-2 border-white/30 shadow-[2px_2px_0_#4b5563] transition-colors active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

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
			{/* 左右を1行にまとめて items-center に高さを揃えさせる。
			    全幅に伸びる行なので、行自体はクリックを透過させて中身だけ拾う。 */}
			<div className="absolute top-4 left-8 right-4 flex items-center justify-between pointer-events-none">
				<div className="flex items-center gap-2 pointer-events-auto">
					<Link
						href="/"
						className="font-pixel text-lg text-white select-none tracking-wide transition-colors hover:text-white/70"
					>
						ojoxux.com
					</Link>
					<HatenaStar />
				</div>
				<div className="flex items-center gap-2 pointer-events-auto">
					{isBirthdayToday && (
						<button
							type="button"
							onClick={() => setShowFireworks(!showFireworks)}
							className={pixelButtonClass}
							aria-label={showFireworks ? "花火を非表示" : "花火を表示"}
						>
							<PartyPopper
								className={`w-5 h-5 transition-colors ${showFireworks ? "text-white" : "text-white/40"}`}
							/>
						</button>
					)}
					<button
						type="button"
						onClick={() => setShowSnow(!showSnow)}
						className={pixelButtonClass}
						aria-label={showSnow ? "雪を非表示" : "雪を表示"}
					>
						<Snowflake
							className={`w-5 h-5 transition-colors ${showSnow ? "text-white" : "text-white/40"}`}
						/>
					</button>
				</div>
			</div>
		</div>
	);
}
