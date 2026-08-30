import Image from "next/image";
import Link from "next/link";
import HatenaStar from "./HatenaStar";
import SocialLinks from "./SocialLinks";

export default function Profile() {
	return (
		<div className="flex flex-col gap-6 text-white">
			<div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/15 bg-white/5">
				<Image
					src="/avatar.png"
					alt="Ojoxux"
					fill
					sizes="(min-width: 1024px) 33vw, 100vw"
					className="object-cover"
					priority
				/>
			</div>
			<div className="flex items-center gap-3">
				<Link href="/">
					<h1 className="text-4xl font-bold tracking-wide">Ojoxux</h1>
				</Link>
				<span className="inline-flex h-8 items-center justify-center">
					<HatenaStar />
				</span>
			</div>
			<span className="select-none font-mono text-xs text-white/20">
				44112f7c-1326-47f3-bea8-138e5ac9f02d
			</span>
			<p className="text-base leading-relaxed text-white/70">
				しがないWebエンジニア．最近は関数型言語に関心がある．
			</p>
			<div className="border-t border-white/15" />
			<div className="flex flex-col gap-4">
				<h2 className="text-sm font-semibold tracking-wide text-white/60">
					Links
				</h2>
				<SocialLinks />
			</div>
		</div>
	);
}
