import { ExternalLink, Github, TwitterBird } from "pixelarticons/react";
import type { ComponentType, SVGProps } from "react";

type SocialLink = {
	label: string;
	href: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const links: SocialLink[] = [
	{
		label: "GitHub",
		href: "https://github.com/Ojoxux",
		icon: Github,
	},
	{
		label: "X",
		href: "https://x.com/ojoxux",
		icon: TwitterBird,
	},
	{
		label: "はてなブログ",
		href: "https://ojoxux.hatenablog.com",
		icon: ExternalLink,
	},
];

export default function SocialLinks() {
	return (
		<ul className="flex flex-col gap-2">
			{links.map(({ label, href, icon: Icon }) => (
				<li key={label}>
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
					>
						<Icon className="w-4 h-4" />
						{label}
					</a>
				</li>
			))}
		</ul>
	);
}
