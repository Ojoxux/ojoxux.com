"use client";

import { PartyPopper } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Fireworks from "./birthday/Fireworks";
import { resolveBirthdayMode } from "./birthday/mode";
import Profile from "./Profile";
import VisitorCounter from "./VisitorCounter";

const toggleButtonClass =
	"p-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors";

type HomeClientProps = {
	wakaTimeSlot: ReactNode;
	writingListSlot: ReactNode;
};

export default function HomeClient({
	wakaTimeSlot,
	writingListSlot,
}: HomeClientProps) {
	const [birthdayMode, setBirthdayMode] = useState(false);
	const [showFireworks, setShowFireworks] = useState(true);

	useEffect(() => {
		setBirthdayMode(resolveBirthdayMode(new Date()));
	}, []);

	return (
		<div className="min-h-screen">
			<div className="fixed inset-0 -z-10 bg-black pointer-events-none">
				{birthdayMode && showFireworks && <Fireworks />}
			</div>

			<div className="w-full max-w-[84rem]">
				<main className="grid grid-cols-1 gap-16 px-8 lg:h-screen lg:grid-cols-[1fr_1.1fr_1.2fr] lg:gap-0 lg:px-12">
					<div className="flex w-full flex-col gap-12 py-16 lg:sticky lg:top-0 lg:h-screen lg:min-h-0 lg:overflow-y-auto lg:pr-8">
						<Profile />
						<div className="mt-auto flex flex-col gap-6">
							{birthdayMode && (
								<div className="flex items-center gap-3">
									<button
										type="button"
										onClick={() => setShowFireworks(!showFireworks)}
										className={toggleButtonClass}
										aria-label={showFireworks ? "花火を非表示" : "花火を表示"}
									>
										<PartyPopper
											className={`w-5 h-5 transition-colors ${showFireworks ? "text-white" : "text-white/40"}`}
										/>
									</button>
								</div>
							)}
							<div className="mt-28">
								<VisitorCounter />
							</div>
						</div>
					</div>
					<div className="relative lg:h-full lg:min-h-0">
						<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10 lg:hidden" />
						<div className="pointer-events-none absolute inset-y-12 left-0 hidden w-px bg-white/10 lg:block" />
						<div className="py-16 lg:h-full lg:overflow-y-auto lg:px-8">
							{wakaTimeSlot}
						</div>
					</div>
					<div className="relative lg:h-full lg:min-h-0">
						<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10 lg:hidden" />
						<div className="pointer-events-none absolute inset-y-12 left-0 hidden w-px bg-white/10 lg:block" />
						<div className="pointer-events-none absolute inset-y-12 right-0 hidden w-px bg-white/10 lg:block" />
						<div className="py-16 lg:h-full lg:overflow-y-auto lg:px-8">
							{writingListSlot}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
