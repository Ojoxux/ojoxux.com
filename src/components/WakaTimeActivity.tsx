import * as stylex from "@stylexjs/stylex";
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
		<div {...stylex.props(styles.root)}>
			<div {...stylex.props(styles.headingGroup)}>
				<h2 {...stylex.props(styles.sectionHeading)}>Activity</h2>
				<p {...stylex.props(styles.total)}>
					<span>{totalText}</span>
					{rangeText && (
						<span {...stylex.props(styles.range)}>{rangeText}</span>
					)}
				</p>
			</div>
			<ul {...stylex.props(styles.list)}>
				{languages.map((language) => {
					const filledBlocks = filledBlocksForPercent(language.percent);

					return (
						<li key={language.name} {...stylex.props(styles.row)}>
							<span {...stylex.props(styles.language)}>{language.name}</span>
							<div {...stylex.props(styles.metrics)}>
								<div {...stylex.props(styles.blocks)}>
									{Array.from({ length: ROW_BLOCKS }, (_, blockIndex) => (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: ブロックは同一の見た目で並び替えが起きないため index キーで問題ない
											key={blockIndex}
											{...stylex.props(
												styles.block,
												blockIndex < filledBlocks
													? styles.blockFilled
													: styles.blockEmpty,
											)}
										/>
									))}
								</div>
								<span {...stylex.props(styles.duration)}>{language.text}</span>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

const styles = stylex.create({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: 20,
		color: "#fff",
	},
	headingGroup: {
		display: "flex",
		flexDirection: "column",
		gap: 4,
	},
	sectionHeading: {
		margin: 0,
		fontSize: "0.875rem",
		lineHeight: "1.25rem",
		fontWeight: "inherit",
		textTransform: "uppercase",
		letterSpacing: "0.05em",
		color: "rgba(255, 255, 255, 0.5)",
	},
	total: {
		margin: 0,
		fontSize: "1.875rem",
		lineHeight: "2.25rem",
		fontWeight: 700,
		color: "#fff",
	},
	range: {
		marginLeft: 8,
		fontSize: "0.875rem",
		lineHeight: "1.25rem",
		color: "rgba(255, 255, 255, 0.4)",
	},
	list: {
		display: "flex",
		flexDirection: "column",
		gap: 12,
		margin: 0,
		padding: 0,
		listStyle: "none",
	},
	row: {
		display: "flex",
		alignItems: "center",
	},
	language: {
		width: 112,
		marginRight: 4,
		flexShrink: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		fontSize: "0.875rem",
		lineHeight: "1.25rem",
		color: "rgba(255, 255, 255, 0.8)",
	},
	metrics: {
		display: "flex",
		minWidth: 0,
		flex: 1,
		alignItems: "center",
		gap: 12,
	},
	blocks: {
		display: "flex",
		height: 8,
		minWidth: 0,
		flex: 1,
		gap: 2,
	},
	block: {
		height: "100%",
		flex: 1,
		borderRadius: 1,
	},
	blockFilled: {
		backgroundColor: "rgba(255, 255, 255, 0.7)",
	},
	blockEmpty: {
		backgroundColor: "rgba(255, 255, 255, 0.1)",
	},
	duration: {
		minWidth: 96,
		flexShrink: 0,
		whiteSpace: "nowrap",
		textAlign: "right",
		fontSize: "0.75rem",
		lineHeight: "1rem",
		color: "rgba(255, 255, 255, 0.4)",
	},
});
