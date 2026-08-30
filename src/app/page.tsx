import { Effect } from "effect";
import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";
import WakaTimeSection from "@/components/WakaTimeSection";
import WritingSection from "@/components/WritingSection";
import { BasePage } from "@/lib/runtime";

function WakaTimeFallback() {
	return (
		<div className="flex animate-pulse flex-col gap-5">
			<div className="flex flex-col gap-1">
				<div className="h-5 w-20 rounded bg-white/10" />
				<div className="h-7 w-36 rounded bg-white/10" />
			</div>
			<div className="h-2.5 w-full rounded-full bg-white/10" />
		</div>
	);
}

function WritingFallback() {
	return (
		<div className="flex animate-pulse flex-col gap-7">
			<div className="h-5 w-14 rounded bg-white/10" />
			<div className="flex flex-col gap-8">
				{[0, 1, 2].map((index) => (
					<div key={index} className="flex flex-col gap-3">
						<div className="aspect-video w-full rounded-sm bg-white/10" />
						<div className="h-5 w-3/4 rounded bg-white/10" />
						<div className="h-4 w-24 rounded bg-white/10" />
					</div>
				))}
			</div>
		</div>
	);
}

const HomePage = Effect.fn("HomePage")(() =>
	Effect.sync(() => (
		<HomeClient
			wakaTimeSlot={
				<Suspense fallback={<WakaTimeFallback />}>
					<WakaTimeSection />
				</Suspense>
			}
			writingListSlot={
				<Suspense fallback={<WritingFallback />}>
					<WritingSection />
				</Suspense>
			}
		/>
	)),
);

export default BasePage.build(HomePage);
