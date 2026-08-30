import type { BlogPost } from "@/lib/hatena-blog";

export default function WritingList({ posts }: { posts: BlogPost[] }) {
	if (posts.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-col gap-7 text-white">
			<h2 className="text-sm uppercase tracking-wider text-white/50">Posts</h2>
			<ul className="flex flex-col gap-8">
				{posts.map((post) => (
					<li key={post.link}>
						<a
							href={post.link}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex flex-col gap-3"
						>
							{post.thumbnail ? (
								// biome-ignore lint/performance/noImgElement: thumbnail domain varies per post (Hatena CDN), next/image requires a static allowlist
								<img
									src={post.thumbnail}
									alt=""
									loading="lazy"
									className="aspect-video w-full rounded-sm object-cover transition-opacity group-hover:opacity-80"
								/>
							) : (
								<div className="aspect-video w-full rounded-sm bg-white/10" />
							)}
							<div className="flex flex-col gap-1">
								<span className="text-lg text-white/90 transition-colors group-hover:text-white">
									{post.title}
								</span>
								<span className="text-sm text-white/40">{post.pubDate}</span>
							</div>
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
