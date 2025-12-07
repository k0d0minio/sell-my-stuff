import type { MetadataRoute } from "next";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Website Starter";
const siteDescription =
	process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
	"A modern website starter template built with Next.js, TypeScript, and Tailwind CSS";
const themeColor = process.env.NEXT_PUBLIC_THEME_COLOR || "#000000";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: siteName,
		short_name: siteName,
		description: siteDescription,
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: themeColor,
		orientation: "portrait-primary",
		icons: [
			{
				src: "/icon-192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/apple-touch-icon.png",
				sizes: "180x180",
				type: "image/png",
			},
		],
	};
}
