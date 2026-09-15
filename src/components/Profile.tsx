import * as stylex from "@stylexjs/stylex";
import Image from "next/image";
import Link from "next/link";
import FlipName from "./FlipName";
import HatenaStar from "./HatenaStar";
import SectionDivider from "./SectionDivider";
import SectionHeading from "./SectionHeading";
import SocialLinks from "./SocialLinks";

const desktop = "@media (min-width: 640px)";

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
						<FlipName front="Ojoxux" back="Jou Okuyama" />
					</h1>
				</Link>
			</div>
			<span {...stylex.props(styles.identifier)}>
				44112f7c-1326-47f3-bea8-138e5ac9f02d
			</span>
			<p {...stylex.props(styles.bio)}>
				しがないWebエンジニア．最近は関数型言語に関心がある．
			</p>
			<div {...stylex.props(styles.hatenaStar)}>
				<HatenaStar />
			</div>
			<div {...stylex.props(styles.profileDivider)}>
				<SectionDivider wavelength={32} amplitude={5} speed={2.5} />
			</div>
			<div {...stylex.props(styles.links)}>
				<SectionHeading>Links</SectionHeading>
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
	hatenaStar: {
		display: "inline-flex",
		alignSelf: "flex-start",
		height: 32,
		alignItems: "center",
		marginTop: 12,
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
		marginTop: {
			default: 20,
			[desktop]: 32,
		},
		marginBottom: 32,
		marginInline: {
			default: 0,
			[desktop]: -32,
		},
		position: "relative",
		left: {
			default: "50%",
			[desktop]: "auto",
		},
		width: {
			default: "100vw",
			[desktop]: "auto",
		},
		transform: {
			default: "translateX(-50%)",
			[desktop]: "none",
		},
	},
	links: {
		display: "flex",
		flexDirection: "column",
		gap: 16,
	},
});
