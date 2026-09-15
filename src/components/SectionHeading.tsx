import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

export default function SectionHeading({ children }: { children: ReactNode }) {
	return <h2 {...stylex.props(styles.root)}>{children}</h2>;
}

const styles = stylex.create({
	root: {
		margin: 0,
		fontSize: "1.125rem",
		lineHeight: "1.75rem",
		fontWeight: 600,
		textTransform: "capitalize",
		letterSpacing: "0.05em",
		color: "rgba(255, 255, 255, 0.6)",
	},
});
