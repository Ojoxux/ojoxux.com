import * as stylex from "@stylexjs/stylex";
import { Effect } from "effect";
import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";
import WakaTimeSection from "@/components/WakaTimeSection";
import WritingSection from "@/components/WritingSection";
import { BasePage } from "@/lib/runtime";

function WakaTimeFallback() {
	return (
		<div {...stylex.props(styles.wakaFallback)}>
			<div {...stylex.props(styles.fallbackHeading)}>
				<div {...stylex.props(styles.wakaLabel)} />
				<div {...stylex.props(styles.wakaTotal)} />
			</div>
			<div {...stylex.props(styles.wakaBar)} />
		</div>
	);
}

function WritingFallback() {
	return (
		<div {...stylex.props(styles.writingFallback)}>
			<div {...stylex.props(styles.postsLabel)} />
			<div {...stylex.props(styles.postList)}>
				{[0, 1, 2].map((index) => (
					<div key={index} {...stylex.props(styles.post)}>
						<div {...stylex.props(styles.postImage)} />
						<div {...stylex.props(styles.postTitle)} />
						<div {...stylex.props(styles.postDate)} />
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

const pulse = stylex.keyframes({
	"50%": {
		opacity: 0.5,
	},
});

const styles = stylex.create({
	wakaFallback: {
		display: "flex",
		flexDirection: "column",
		gap: 20,
		animationName: pulse,
		animationDuration: "2s",
		animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
		animationIterationCount: "infinite",
	},
	fallbackHeading: {
		display: "flex",
		flexDirection: "column",
		gap: 4,
	},
	wakaLabel: {
		width: 80,
		height: 20,
		borderRadius: 4,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
	},
	wakaTotal: {
		width: 144,
		height: 28,
		borderRadius: 4,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
	},
	wakaBar: {
		width: "100%",
		height: 10,
		borderRadius: 9999,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
	},
	writingFallback: {
		display: "flex",
		flexDirection: "column",
		gap: 28,
		animationName: pulse,
		animationDuration: "2s",
		animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
		animationIterationCount: "infinite",
	},
	postsLabel: {
		width: 56,
		height: 20,
		borderRadius: 4,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
	},
	postList: {
		display: "flex",
		flexDirection: "column",
		gap: 32,
	},
	post: {
		display: "flex",
		flexDirection: "column",
		gap: 12,
	},
	postImage: {
		aspectRatio: "16 / 9",
		width: "100%",
		borderRadius: 2,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
	},
	postTitle: {
		width: "75%",
		height: 20,
		borderRadius: 4,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
	},
	postDate: {
		width: 96,
		height: 16,
		borderRadius: 4,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
	},
});
