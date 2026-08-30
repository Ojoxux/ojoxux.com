import { getLatestBlogPosts } from "@/lib/hatena-blog";
import WritingList from "./WritingList";

const BLOG_POST_LIMIT = 5;

export default async function WritingSection() {
	const posts = await getLatestBlogPosts(BLOG_POST_LIMIT);

	return <WritingList posts={posts} />;
}
