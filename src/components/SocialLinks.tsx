import * as stylex from "@stylexjs/stylex";
import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import { GithubIcon, XIcon, ZennIcon } from "./icons";

const desktop = "@media (min-width: 640px)";

type SocialLink =
	| {
			label: string;
			account: string;
			href: string;
			icon: ComponentType<SVGProps<SVGSVGElement>>;
	  }
	| {
			label: string;
			account: string;
			href: string;
			image: { src: string };
	  };

const links: SocialLink[] = [
	{
		label: "GitHub",
		account: "Ojoxux",
		href: "https://github.com/Ojoxux",
		icon: GithubIcon,
	},
	{
		label: "X",
		account: "Ojoxux__18",
		href: "https://x.com/ojoxux__18",
		icon: XIcon,
	},
	{
		label: "はてなブログ",
		account: "でってまんず、もっけだの",
		href: "https://ojoxux.hatenablog.com",
		image: { src: "/hatena-blog.png" },
	},
	{
		label: "Zenn",
		account: "Ojoxux",
		href: "https://zenn.dev/ojoxux",
		icon: ZennIcon,
	},
];

export default function SocialLinks() {
	return (
		<ul {...stylex.props(styles.list)}>
			{links.map((link) => (
				<li key={link.label} {...stylex.props(styles.item)}>
					<a
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`${link.label}: ${link.account}`}
						{...stylex.props(styles.link)}
					>
						{"icon" in link ? (
							<link.icon aria-hidden="true" {...stylex.props(styles.icon)} />
						) : (
							<Image
								src={link.image.src}
								alt=""
								width={28}
								height={28}
								{...stylex.props(styles.image)}
							/>
						)}
						<span {...stylex.props(styles.account)}>{link.account}</span>
					</a>
				</li>
			))}
		</ul>
	);
}

const styles = stylex.create({
	list: {
		display: "flex",
		flexDirection: "column",
		alignItems: "stretch",
		gap: {
			default: 12,
			[desktop]: 16,
		},
		margin: 0,
		padding: 0,
		listStyle: "none",
	},
	item: {
		display: "flex",
	},
	link: {
		display: "flex",
		width: "100%",
		alignItems: "center",
		gap: 12,
		color: {
			default: "rgba(255, 255, 255, 0.7)",
			":hover": "#fff",
		},
		textDecoration: "none",
		transitionProperty: "color",
		transitionDuration: "150ms",
	},
	icon: {
		width: 28,
		height: 28,
		flexShrink: 0,
	},
	image: {
		width: 28,
		height: 28,
		flexShrink: 0,
		opacity: {
			default: 0.7,
			":hover": 1,
		},
		filter: "invert(1)",
		transitionProperty: "opacity",
		transitionDuration: "150ms",
	},
	account: {
		fontSize: "1.125rem",
		lineHeight: "1.75rem",
	},
});
