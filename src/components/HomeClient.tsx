"use client";

import * as stylex from "@stylexjs/stylex";
import { PartyPopper } from "lucide-react";
import type { ReactNode, UIEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Fireworks from "./birthday/Fireworks";
import { resolveBirthdayMode } from "./birthday/mode";
import Profile from "./Profile";
import VisitorCounter from "./VisitorCounter";

type HomeClientProps = {
	wakaTimeSlot: ReactNode;
	writingListSlot: ReactNode;
};

const columnLabels = ["Profile", "WakaTime", "Writing"];

export default function HomeClient({
	wakaTimeSlot,
	writingListSlot,
}: HomeClientProps) {
	const [birthdayMode, setBirthdayMode] = useState(false);
	const [showFireworks, setShowFireworks] = useState(true);
	const [activeColumn, setActiveColumn] = useState(0);
	const mainRef = useRef<HTMLElement>(null);

	useEffect(() => {
		setBirthdayMode(resolveBirthdayMode(new Date()));
	}, []);

	const handleScroll = (event: UIEvent<HTMLElement>) => {
		const el = event.currentTarget;
		if (el.clientWidth === 0) return;
		setActiveColumn(Math.round(el.scrollLeft / el.clientWidth));
	};

	const scrollToColumn = (index: number) => {
		const el = mainRef.current;
		if (!el) return;
		el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
	};

	return (
		<div {...stylex.props(styles.root)}>
			<div {...stylex.props(styles.background)}>
				{birthdayMode && showFireworks && <Fireworks />}
			</div>

			<div {...stylex.props(styles.container)}>
				<main
					ref={mainRef}
					onScroll={handleScroll}
					{...stylex.props(styles.main)}
				>
					<div {...stylex.props(styles.profileColumn)}>
						<div {...stylex.props(styles.profileContent)}>
							<Profile />
							<div {...stylex.props(styles.profileDetails)}>
								{birthdayMode && (
									<div {...stylex.props(styles.birthdayControls)}>
										<button
											type="button"
											onClick={() => setShowFireworks(!showFireworks)}
											{...stylex.props(styles.toggleButton)}
											aria-label={showFireworks ? "花火を非表示" : "花火を表示"}
										>
											<PartyPopper
												{...stylex.props(
													styles.partyIcon,
													showFireworks
														? styles.iconActive
														: styles.iconInactive,
												)}
											/>
										</button>
									</div>
								)}
								<div {...stylex.props(styles.visitor)}>
									<h2 {...stylex.props(styles.sectionHeading)}>Visitor</h2>
									<VisitorCounter />
								</div>
							</div>
						</div>
					</div>
					<div {...stylex.props(styles.panel)}>
						<div {...stylex.props(styles.verticalDivider)} />
						<div {...stylex.props(styles.panelContent)}>{wakaTimeSlot}</div>
					</div>
					<div {...stylex.props(styles.panel)}>
						<div {...stylex.props(styles.verticalDivider)} />
						<div
							{...stylex.props(styles.verticalDivider, styles.rightDivider)}
						/>
						<div {...stylex.props(styles.panelContent)}>{writingListSlot}</div>
					</div>
				</main>
				<nav {...stylex.props(styles.scrollGuide)} aria-label="セクション">
					{columnLabels.map((label, index) => (
						<button
							key={label}
							type="button"
							onClick={() => scrollToColumn(index)}
							aria-label={`${label}へ移動`}
							aria-current={activeColumn === index ? "true" : undefined}
							{...stylex.props(
								styles.scrollGuideDot,
								activeColumn === index && styles.scrollGuideDotActive,
							)}
						/>
					))}
				</nav>
			</div>
		</div>
	);
}

const desktop = "@media (min-width: 1024px)";

const styles = stylex.create({
	root: {
		minHeight: "100vh",
	},
	background: {
		position: "fixed",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		zIndex: -10,
		backgroundColor: "#000",
		pointerEvents: "none",
	},
	container: {
		width: "100%",
		maxWidth: "84rem",
	},
	main: {
		display: "grid",
		gridTemplateColumns: {
			default: "none",
			[desktop]: "1fr 1.1fr 1.2fr",
		},
		gridAutoFlow: {
			default: "column",
			[desktop]: "row",
		},
		gridAutoColumns: {
			default: "100%",
			[desktop]: "auto",
		},
		gridAutoRows: {
			default: "100%",
			[desktop]: "auto",
		},
		gap: 0,
		overflowX: {
			default: "auto",
			[desktop]: "visible",
		},
		overflowY: {
			default: "hidden",
			[desktop]: "visible",
		},
		overscrollBehaviorX: "contain",
		scrollSnapType: {
			default: "x mandatory",
			[desktop]: "none",
		},
		height: {
			default: "100dvh",
			[desktop]: "100vh",
		},
	},
	profileColumn: {
		display: "flex",
		width: "100%",
		minWidth: 0,
		flexDirection: "column",
		gap: 24,
		paddingTop: 64,
		paddingBottom: {
			default: 32,
			[desktop]: 64,
		},
		position: {
			default: "static",
			[desktop]: "sticky",
		},
		top: {
			default: "auto",
			[desktop]: 0,
		},
		height: {
			default: "100%",
			[desktop]: "100vh",
		},
		minHeight: {
			default: "auto",
			[desktop]: 0,
		},
		overflowY: "auto",
		scrollSnapAlign: {
			default: "start",
			[desktop]: "none",
		},
	},
	profileContent: {
		display: "flex",
		flexDirection: "column",
		gap: 24,
		paddingInline: 32,
	},
	profileDetails: {
		display: "flex",
		flexDirection: "column",
		gap: 24,
	},
	birthdayControls: {
		display: "flex",
		alignItems: "center",
		gap: 12,
	},
	toggleButton: {
		padding: 8,
		borderRadius: 9999,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "rgba(255, 255, 255, 0.15)",
		backgroundColor: {
			default: "rgba(255, 255, 255, 0.05)",
			":hover": "rgba(255, 255, 255, 0.1)",
		},
		transitionProperty: "background-color",
		transitionDuration: "150ms",
	},
	partyIcon: {
		width: 20,
		height: 20,
		transitionProperty: "color",
		transitionDuration: "150ms",
	},
	iconActive: {
		color: "#fff",
	},
	iconInactive: {
		color: "rgba(255, 255, 255, 0.4)",
	},
	visitor: {
		display: "flex",
		flexDirection: "column",
		gap: 16,
	},
	sectionHeading: {
		fontSize: "0.875rem",
		lineHeight: "1.25rem",
		fontWeight: 600,
		letterSpacing: "0.025em",
		color: "rgba(255, 255, 255, 0.6)",
	},
	panel: {
		position: "relative",
		minWidth: 0,
		height: "100%",
		minHeight: {
			default: "auto",
			[desktop]: 0,
		},
		scrollSnapAlign: {
			default: "start",
			[desktop]: "none",
		},
	},
	verticalDivider: {
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		width: 1,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		pointerEvents: "none",
		display: "block",
	},
	rightDivider: {
		right: 0,
		left: "auto",
		display: {
			default: "none",
			[desktop]: "block",
		},
	},
	panelContent: {
		paddingInline: 32,
		paddingBlock: 64,
		height: "100%",
		overflowY: "auto",
	},
	scrollGuide: {
		position: "fixed",
		bottom: 20,
		left: 0,
		right: 0,
		display: {
			default: "flex",
			[desktop]: "none",
		},
		justifyContent: "center",
		gap: 10,
		pointerEvents: "none",
	},
	scrollGuideDot: {
		width: 7,
		height: 7,
		padding: 0,
		borderRadius: 9999,
		borderWidth: 0,
		backgroundColor: "rgba(255, 255, 255, 0.25)",
		pointerEvents: "auto",
		transitionProperty: "background-color, width",
		transitionDuration: "200ms",
	},
	scrollGuideDotActive: {
		width: 18,
		backgroundColor: "rgba(255, 255, 255, 0.75)",
	},
});
