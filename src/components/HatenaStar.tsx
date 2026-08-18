"use client";

import Script from "next/script";

declare global {
	interface Window {
		Hatena?: {
			Star: {
				SiteConfig: {
					entryNodes: Record<
						string,
						{ uri: string; title: string; container: string }
					>;
				};
			};
		};
	}
}

const initHatenaStar = () => {
	if (!window.Hatena) return;
	window.Hatena.Star.SiteConfig = {
		entryNodes: {
			body: {
				uri: "document.location",
				title: "document.title",
				container: "#hatena-star",
			},
		},
	};
	// HatenaStar.jsはwindowの"DOMContentLoaded"で初期化されるけど，動的読み込みだと発火済みで間に合わないので手動で再発火させる。
	window.dispatchEvent(new Event("DOMContentLoaded"));
};

export default function HatenaStar() {
	return (
		<>
			<Script
				src="https://s.hatena.ne.jp/js/HatenaStar.js"
				strategy="afterInteractive"
				onLoad={initHatenaStar}
			/>
			{/* biome-ignore lint/correctness/useUniqueElementIds: HatenaStar.js側の固定セレクタ */}
			<span id="hatena-star" />
		</>
	);
}
