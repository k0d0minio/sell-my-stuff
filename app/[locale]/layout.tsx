import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { CookieConsent } from "@/components/cookie-consent";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorHandlers } from "@/components/error-handlers";
import { routing } from "@/i18n/routing";
import { defaultMetadata } from "@/lib/metadata";
import {
	createOrganizationSchema,
	createWebSiteSchema,
	generateStructuredDataScript,
} from "@/lib/seo/structured-data";
import "../globals.css";

const inter = Inter({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

	return {
		...defaultMetadata,
		alternates: {
			canonical: `${siteUrl}/${locale}`,
			languages: Object.fromEntries(
				routing.locales.map((loc) => [loc, `${siteUrl}/${loc}`]),
			),
		},
		openGraph: {
			...defaultMetadata.openGraph,
			locale: locale,
			alternateLocale: routing.locales.filter((loc) => loc !== locale),
			url: `${siteUrl}/${locale}`,
		},
	};
}

export default async function LocaleLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}>) {
	const { locale } = await params;

	// Ensure that the incoming `locale` is valid
	if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
		notFound();
	}

	// Providing all messages to the client
	// side is the easiest way to get started
	const messages = await getMessages();

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Website Starter";
	const siteDescription =
		process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
		"A modern website starter template built with Next.js, TypeScript, and Tailwind CSS";

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
		<html lang={locale}>
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
					{/* Translation will be added via getTranslations if needed */}
					Skip to main content
				</a>
				<NextIntlClientProvider messages={messages}>
					<ErrorBoundary>
						{children}
						<ErrorHandlers />
					</ErrorBoundary>
					<CookieConsent />
				</NextIntlClientProvider>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
