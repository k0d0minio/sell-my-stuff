import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Website Starter";
const siteDescription =
	process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
	"A modern website starter template built with Next.js, TypeScript, and Tailwind CSS";
const siteKeywords = process.env.NEXT_PUBLIC_SITE_KEYWORDS
	? process.env.NEXT_PUBLIC_SITE_KEYWORDS.split(",").map((k) => k.trim())
	: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Website"];
const authorName = process.env.NEXT_PUBLIC_AUTHOR_NAME || "Your Name";
const creatorName = process.env.NEXT_PUBLIC_CREATOR_NAME || "Your Name";
const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@yourusername";
const ogImageUrl = process.env.NEXT_PUBLIC_OG_IMAGE_URL;
const siteLocale = process.env.NEXT_PUBLIC_SITE_LOCALE || "en_US";
const themeColor = process.env.NEXT_PUBLIC_THEME_COLOR || "#000000";
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.NEXT_PUBLIC_BING_VERIFICATION;
const yandexVerification = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION;

export const defaultMetadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: siteName,
		template: `%s | ${siteName}`,
	},
	description: siteDescription,
	keywords: siteKeywords,
	authors: [
		{
			name: authorName,
		},
	],
	creator: creatorName,
	applicationName: siteName,
	manifest: "/manifest.json",
	openGraph: {
		type: "website",
		locale: siteLocale,
		alternateLocale: siteLocale !== "en_US" ? ["en_US"] : undefined,
		url: siteUrl,
		title: siteName,
		description: siteDescription,
		siteName: siteName,
		...(ogImageUrl && {
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: siteName,
				},
			],
		}),
	},
	twitter: {
		card: "summary_large_image",
		title: siteName,
		description: siteDescription,
		creator: twitterHandle,
		...(ogImageUrl && { images: [ogImageUrl] }),
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon-192.png", sizes: "192x192", type: "image/png" },
			{ url: "/icon-512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [
			{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
		],
	},
	verification: {
		...(googleVerification && { google: googleVerification }),
		...(bingVerification && { other: { "msvalidate.01": bingVerification } }),
	},
	other: {
		...(yandexVerification && { "yandex-verification": yandexVerification }),
		"theme-color": themeColor,
	},
};

/**
 * Creates page-specific metadata by merging with default metadata.
 *
 * This helper function ensures all pages have consistent base metadata while allowing
 * page-specific overrides. It automatically handles canonical URLs and Open Graph data.
 *
 * @param overrides - Metadata overrides for the specific page
 * @returns A complete Metadata object ready for Next.js page export
 *
 * @example
 * ```tsx
 * export const metadata = createMetadata({
 *   title: "About Us",
 *   description: "Learn more about our company",
 *   openGraph: {
 *     title: "About Us - Company Name",
 *     images: [{ url: "/og-about.jpg" }]
 *   }
 * });
 * ```
 */
export function createMetadata(overrides: Metadata = {}): Metadata {
	// Determine canonical URL
	let canonicalUrl: string | URL | undefined;
	if (overrides.alternates?.canonical) {
		canonicalUrl =
			typeof overrides.alternates.canonical === "string"
				? overrides.alternates.canonical
				: overrides.alternates.canonical.toString();
	} else if (overrides.openGraph?.url) {
		canonicalUrl =
			typeof overrides.openGraph.url === "string"
				? overrides.openGraph.url
				: overrides.openGraph.url.toString();
	} else if (overrides.metadataBase) {
		canonicalUrl = overrides.metadataBase.toString();
	}

	// Ensure canonical URL is absolute
	if (
		canonicalUrl &&
		typeof canonicalUrl === "string" &&
		!canonicalUrl.startsWith("http")
	) {
		try {
			canonicalUrl = new URL(canonicalUrl, siteUrl).toString();
		} catch {
			canonicalUrl = siteUrl;
		}
	}

	const finalCanonical = canonicalUrl || siteUrl;

	return {
		...defaultMetadata,
		...overrides,
		alternates: {
			canonical: finalCanonical,
			...(overrides.alternates || {}),
		},
		openGraph: {
			...defaultMetadata.openGraph,
			...overrides.openGraph,
			url: overrides.openGraph?.url || finalCanonical,
		},
		twitter: {
			...defaultMetadata.twitter,
			...overrides.twitter,
		},
	};
}
