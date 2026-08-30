import type { WakaTimeActivity as WakaTimeActivityData } from "@/lib/wakatime";

const ROW_BLOCKS = 10;

function filledBlocksForPercent(percent: number): number {
	return Math.round((percent / 100) * ROW_BLOCKS);
}

export default function WakaTimeActivity({
	activity,
}: {
	activity: WakaTimeActivityData;
}) {
	const { languages, totalText, rangeText } = activity;

	if (languages.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col gap-5 text-white">
			<div className="flex flex-col gap-1">
				<h2 className="text-sm uppercase tracking-wider text-white/50">
					Activity
				</h2>
				<p className="text-3xl font-bold text-white">
					<span>{totalText}</span>
					{rangeText && (
						<span className="ml-2 text-sm text-white/40">{rangeText}</span>
					)}
				</p>
			</div>
			<ul className="flex flex-col gap-3">
				{languages.map((language) => {
					const filledBlocks = filledBlocksForPercent(language.percent);

					return (
						<li key={language.name} className="flex items-center">
							<span className="mr-1 w-28 shrink-0 truncate text-sm text-white/80">
								{language.name}
							</span>
							<div className="flex min-w-0 flex-1 items-center gap-3">
								<div className="flex h-2 min-w-0 flex-1 gap-0.5">
									{Array.from({ length: ROW_BLOCKS }, (_, blockIndex) => (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: ブロックは同一の見た目で並び替えが起きないため index キーで問題ない
											key={blockIndex}
											className={`h-full flex-1 rounded-[1px] ${
												blockIndex < filledBlocks
													? "bg-white/70"
													: "bg-white/10"
											}`}
										/>
									))}
								</div>
								<span className="min-w-24 shrink-0 whitespace-nowrap text-right text-xs text-white/40">
									{language.text}
								</span>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
