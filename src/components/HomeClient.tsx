"use client";

import * as stylex from "@stylexjs/stylex";
import { PartyPopper } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Fireworks from "./birthday/Fireworks";
import { resolveBirthdayMode } from "./birthday/mode";
import Profile from "./Profile";
import SectionDivider from "./SectionDivider";
import VisitorCounter from "./VisitorCounter";

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
		<div {...stylex.props(styles.root)}>
			<div {...stylex.props(styles.background)}>
				{birthdayMode && showFireworks && <Fireworks />}
			</div>

			<div {...stylex.props(styles.container)}>
				<main {...stylex.props(styles.main)}>
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
						<div {...stylex.props(styles.mobileDivider)}>
							<SectionDivider />
						</div>
						<div {...stylex.props(styles.verticalDivider)} />
						<div {...stylex.props(styles.panelContent)}>{wakaTimeSlot}</div>
					</div>
					<div {...stylex.props(styles.panel)}>
						<div {...stylex.props(styles.mobileDivider)}>
							<SectionDivider />
						</div>
						<div {...stylex.props(styles.verticalDivider)} />
						<div
							{...stylex.props(styles.verticalDivider, styles.rightDivider)}
						/>
						<div {...stylex.props(styles.panelContent)}>{writingListSlot}</div>
					</div>
				</main>
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
			default: "1fr",
			[desktop]: "1fr 1.1fr 1.2fr",
		},
		gap: {
			default: 32,
			[desktop]: 0,
		},
		height: {
			default: "auto",
			[desktop]: "100vh",
		},
	},
	profileColumn: {
		display: "flex",
		width: "100%",
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
			default: "auto",
			[desktop]: "100vh",
		},
		minHeight: {
			default: "auto",
			[desktop]: 0,
		},
		overflowY: {
			default: "visible",
			[desktop]: "auto",
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
		height: {
			default: "auto",
			[desktop]: "100%",
		},
		minHeight: {
			default: "auto",
			[desktop]: 0,
		},
	},
	mobileDivider: {
		position: "absolute",
		top: 0,
		right: 0,
		left: 0,
		pointerEvents: "none",
		display: {
			default: "block",
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
		display: {
			default: "none",
			[desktop]: "block",
		},
	},
	rightDivider: {
		right: 0,
		left: "auto",
	},
	panelContent: {
		paddingInline: 32,
		paddingBlock: 64,
		height: {
			default: "auto",
			[desktop]: "100%",
		},
		overflowY: {
			default: "visible",
			[desktop]: "auto",
		},
	},
});
