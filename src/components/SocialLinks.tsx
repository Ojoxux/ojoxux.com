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
		<ul className="flex items-center gap-4">
			{links.map((link) => (
				<li key={link.label}>
					<a
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={link.label}
						className="group flex items-center text-white/70 transition-colors hover:text-white"
					>
						{"icon" in link ? (
							<link.icon className="h-7 w-7" />
						) : (
							<Image
								src={link.image.src}
								alt={link.image.alt}
								width={28}
								height={28}
								className="h-7 w-7 opacity-70 invert transition-opacity group-hover:opacity-100"
							/>
						)}
					</a>
				</li>
			))}
		</ul>
	);
}
