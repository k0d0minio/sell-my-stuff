import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CookieConsent } from "@/components/cookie-consent";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorHandlers } from "@/components/error-handlers";
import { defaultMetadata } from "@/lib/metadata";
import {
	createOrganizationSchema,
	createWebSiteSchema,
	generateStructuredDataScript,
} from "@/lib/seo/structured-data";
import "./globals.css";

const inter = Inter({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	...defaultMetadata,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Second Hand Store";
	const siteDescription =
		process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
		"Find great deals on second-hand items";

	const schemas = [
		createOrganizationSchema(),
		createWebSiteSchema({
			name: siteName,
			url: siteUrl,
			description: siteDescription,
		}),
	];

	const structuredData = generateStructuredDataScript(schemas);

	return (
		<html lang="en">
			<body
				className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
			>
				<script
					id="structured-data"
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe, controlled content
					dangerouslySetInnerHTML={{ __html: structuredData }}
				/>
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
				>
					Skip to main content
				</a>
				<ErrorBoundary>
					{children}
					<ErrorHandlers />
				</ErrorBoundary>
				<CookieConsent />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
