import * as stylex from "@stylexjs/stylex";

export default function NotFound() {
	return (
		<div {...stylex.props(styles.root)}>
			<div {...stylex.props(styles.content)}>
				<h1 {...stylex.props(styles.title)}>404</h1>
			</div>
		</div>
	);
}

const styles = stylex.create({
	root: {
		display: "flex",
		minHeight: "100vh",
		alignItems: "center",
		justifyContent: "center",
		paddingInline: 16,
		backgroundColor: "#000",
	},
	content: {
		textAlign: "center",
	},
	title: {
		marginTop: 0,
		marginBottom: 32,
		fontSize: "15vw",
		fontWeight: 700,
		color: "#fff",
		filter: "drop-shadow(8px 8px 0 #4b5563)",
		userSelect: "none",
	},
});
