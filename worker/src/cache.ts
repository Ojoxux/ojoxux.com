// Cache API のキーに使う仮想オリジン（実在しないホストで問題ない）
const CACHE_ORIGIN = "https://cache.ojoxux.internal";

// load が成功（null 以外）したときだけ ttlSeconds 秒キャッシュする。
// 失敗時の空データをキャッシュしないのは、現行の Next.js の fetch キャッシュと同じ挙動。
// workers.dev ドメインでは Cache API が no-op になるので、staging では毎回 load が走る。
export async function withCache<T>(
	key: string,
	ttlSeconds: number,
	load: () => Promise<T | null>,
): Promise<T | null> {
	const cache = caches.default;
	const request = new Request(`${CACHE_ORIGIN}/${encodeURIComponent(key)}`);

	// Cache API の失敗はリクエストを落とさず、キャッシュ無しとして扱う
	try {
		const hit = await cache.match(request);
		if (hit) {
			return (await hit.json()) as T;
		}
	} catch (error) {
		console.error("Cache API error:", error);
	}

	const value = await load();
	if (value !== null) {
		try {
			await cache.put(
				request,
				new Response(JSON.stringify(value), {
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": `max-age=${ttlSeconds}`,
					},
				}),
			);
		} catch (error) {
			console.error("Cache API error:", error);
		}
	}

	return value;
}
