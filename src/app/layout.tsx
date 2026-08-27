import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "ojoxux.com",
	icons: [
		{ rel: "icon", url: "/favicon-32-v2.ico", sizes: "32x32" },
		{ rel: "icon", url: "/favicon-16-v2.ico", sizes: "16x16" },
	],
};

export const viewport = {
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={inter.variable}>
			<body>{children}</body>
		</html>
	);
}
