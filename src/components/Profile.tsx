import * as stylex from "@stylexjs/stylex";
import Image from "next/image";
import Link from "next/link";
import HatenaStar from "./HatenaStar";
import SectionDivider from "./SectionDivider";
import SocialLinks from "./SocialLinks";

export default function Profile() {
	return (
		<div {...stylex.props(styles.root)}>
			<div {...stylex.props(styles.avatarFrame)}>
				<Image
					src="/avatar.png"
					alt="Ojoxux"
					fill
					sizes="(min-width: 1024px) 33vw, 100vw"
					{...stylex.props(styles.avatar)}
					priority
				/>
			</div>
			<div {...stylex.props(styles.titleRow)}>
				<Link href="/" {...stylex.props(styles.homeLink)}>
					<h1 {...stylex.props(styles.title)}>
						<span {...stylex.props(styles.flipScene)}>
							<span {...stylex.props(styles.flipInner)}>
								<span {...stylex.props(styles.flipFace)}>Ojoxux</span>
								<span {...stylex.props(styles.flipFace, styles.flipFaceBack)}>
									Jou Okuyama
								</span>
							</span>
						</span>
					</h1>
				</Link>
				<span {...stylex.props(styles.hatenaStar)}>
					<HatenaStar />
				</span>
			</div>
			<span {...stylex.props(styles.identifier)}>
				44112f7c-1326-47f3-bea8-138e5ac9f02d
			</span>
			<p {...stylex.props(styles.bio)}>
				しがないWebエンジニア．最近は関数型言語に関心がある．
			</p>
			<div {...stylex.props(styles.profileDivider)}>
				<SectionDivider wavelength={32} amplitude={5} speed={2.5} />
			</div>
			<div {...stylex.props(styles.links)}>
				<h2 {...stylex.props(styles.sectionHeading)}>Links</h2>
				<SocialLinks />
			</div>
		</div>
	);
}

const styles = stylex.create({
	root: {
		display: "flex",
		flexDirection: "column",
		color: "#fff",
	},
	avatarFrame: {
		position: "relative",
		aspectRatio: "1 / 1",
		width: "100%",
		overflow: "hidden",
		borderRadius: 16,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "rgba(255, 255, 255, 0.15)",
		backgroundColor: "rgba(255, 255, 255, 0.05)",
	},
	avatar: {
		objectFit: "cover",
	},
	titleRow: {
		display: "flex",
		alignItems: "center",
		gap: 12,
		marginTop: 24,
	},
	homeLink: {
		color: "inherit",
		textDecoration: "none",
	},
	title: {
		margin: 0,
		fontSize: "2.25rem",
		lineHeight: "2.5rem",
		fontWeight: 700,
		letterSpacing: "0.025em",
	},
	flipScene: {
		display: "inline-block",
		perspective: "600px",
	},
	flipInner: {
		display: "inline-grid",
		transformStyle: "preserve-3d",
		transitionProperty: "transform",
		transitionDuration: {
			default: "0.6s",
			"@media (prefers-reduced-motion: reduce)": "0.01s",
		},
		transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
		transform: {
			default: "rotateX(0deg)",
			":hover": "rotateX(-180deg)",
		},
	},
	flipFace: {
		gridArea: "1 / 1",
		backfaceVisibility: "hidden",
		whiteSpace: "nowrap",
	},
	flipFaceBack: {
		transform: "rotateX(180deg)",
	},
	hatenaStar: {
		display: "inline-flex",
		height: 32,
		alignItems: "center",
		justifyContent: "center",
	},
	identifier: {
		marginTop: 8,
		userSelect: "none",
		fontFamily: "monospace",
		fontSize: "0.75rem",
		lineHeight: "1rem",
		color: "rgba(255, 255, 255, 0.2)",
	},
	bio: {
		marginTop: 16,
		marginBottom: 0,
		fontSize: "1rem",
		lineHeight: 1.625,
		color: "rgba(255, 255, 255, 0.7)",
	},
	profileDivider: {
		marginBlock: 20,
		marginInline: -32,
	},
	links: {
		display: "flex",
		flexDirection: "column",
		gap: 16,
	},
	sectionHeading: {
		margin: 0,
		fontSize: "0.875rem",
		lineHeight: "1.25rem",
		fontWeight: 600,
		letterSpacing: "0.025em",
		color: "rgba(255, 255, 255, 0.6)",
	},
});
