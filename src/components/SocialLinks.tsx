import * as stylex from "@stylexjs/stylex";
import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import { GithubIcon, XIcon, ZennIcon } from "./icons";

type SocialLink =
	| {
			label: string;
			href: string;
			icon: ComponentType<SVGProps<SVGSVGElement>>;
	  }
	| {
			label: string;
			href: string;
			image: { src: string; alt: string };
	  };

const links: SocialLink[] = [
	{
		label: "GitHub",
		href: "https://github.com/Ojoxux",
		icon: GithubIcon,
	},
	{
		label: "X",
		href: "https://x.com/ojoxux__18",
		icon: XIcon,
	},
	{
		label: "Blogs",
		href: "https://ojoxux.hatenablog.com",
		image: { src: "/hatena-blog.png", alt: "はてなブログ" },
	},
	{
		label: "Zenn",
		href: "https://zenn.dev/ojoxux",
		icon: ZennIcon,
	},
];

export default function SocialLinks() {
	return (
		<ul {...stylex.props(styles.list)}>
			{links.map((link) => (
				<li key={link.label}>
					<a
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={link.label}
						{...stylex.props(styles.link)}
					>
						{"icon" in link ? (
							<link.icon {...stylex.props(styles.icon)} />
						) : (
							<Image
								src={link.image.src}
								alt={link.image.alt}
								width={28}
								height={28}
								{...stylex.props(styles.image)}
							/>
						)}
					</a>
				</li>
			))}
		</ul>
	);
}

const styles = stylex.create({
	list: {
		display: "flex",
		alignItems: "center",
		gap: 16,
		margin: 0,
		padding: 0,
		listStyle: "none",
	},
	link: {
		display: "flex",
		alignItems: "center",
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
	},
	image: {
		width: 28,
		height: 28,
		opacity: {
			default: 0.7,
			":hover": 1,
		},
		filter: "invert(1)",
		transitionProperty: "opacity",
		transitionDuration: "150ms",
	},
});
