import * as stylex from "@stylexjs/stylex";
import type { BlogPost } from "@/lib/hatena-blog";

export default function WritingList({ posts }: { posts: BlogPost[] }) {
	if (posts.length === 0) {
		return null;
	}

	return (
		<div {...stylex.props(styles.root)}>
			<h2 {...stylex.props(styles.sectionHeading)}>Posts</h2>
			<ul {...stylex.props(styles.list)}>
				{posts.map((post) => (
					<li key={post.link}>
						<a
							href={post.link}
							target="_blank"
							rel="noopener noreferrer"
							{...stylex.props(styles.link)}
						>
							{post.thumbnail ? (
								// biome-ignore lint/performance/noImgElement: thumbnail domain varies per post (Hatena CDN), next/image requires a static allowlist
								<img
									src={post.thumbnail}
									alt=""
									loading="lazy"
									{...stylex.props(styles.thumbnail)}
								/>
							) : (
								<div {...stylex.props(styles.thumbnailPlaceholder)} />
							)}
							<div {...stylex.props(styles.meta)}>
								<span {...stylex.props(styles.title)}>{post.title}</span>
								<span {...stylex.props(styles.date)}>{post.pubDate}</span>
							</div>
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}

const styles = stylex.create({
	root: {
		display: "flex",
		flexDirection: "column",
		gap: 28,
		color: "#fff",
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
	list: {
		display: "flex",
		flexDirection: "column",
		gap: 32,
		margin: 0,
		padding: 0,
		listStyle: "none",
	},
	link: {
		display: "flex",
		flexDirection: "column",
		gap: 12,
		color: {
			default: "rgba(255, 255, 255, 0.9)",
			":hover": "#fff",
		},
		textDecoration: "none",
	},
	thumbnail: {
		aspectRatio: "16 / 9",
		width: "100%",
		borderRadius: 2,
		objectFit: "cover",
		opacity: {
			default: 1,
			":hover": 0.8,
		},
		transitionProperty: "opacity",
		transitionDuration: "150ms",
	},
	thumbnailPlaceholder: {
		aspectRatio: "16 / 9",
		width: "100%",
		borderRadius: 2,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
	},
	meta: {
		display: "flex",
		flexDirection: "column",
		gap: 4,
	},
	title: {
		fontSize: "1.125rem",
		lineHeight: "1.75rem",
		color: "inherit",
		transitionProperty: "color",
		transitionDuration: "150ms",
	},
	date: {
		fontSize: "0.875rem",
		lineHeight: "1.25rem",
		color: "rgba(255, 255, 255, 0.4)",
	},
});
