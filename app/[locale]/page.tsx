import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactSection } from "@/components/contact-section";
import { CTASection } from "@/components/cta-section";
import { FeatureGrid } from "@/components/feature-grid";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { createMetadata } from "@/lib/metadata";
import {
	createBreadcrumbListSchema,
	generateStructuredDataScript,
} from "@/lib/seo/structured-data";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale });
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Website Starter";

	return createMetadata({
		title: siteName,
		description: t("hero.description"),
		openGraph: {
			title: siteName,
			description: t("hero.description"),
			url: `${siteUrl}/${locale}`,
		},
		twitter: {
			title: siteName,
			description: t("hero.description"),
		},
	});
}

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations();
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

	const breadcrumbSchema = createBreadcrumbListSchema([
		{ name: t("common.home"), url: `${siteUrl}/${locale}` },
	]);

	const breadcrumbData = generateStructuredDataScript([breadcrumbSchema]);

	return (
		<>
			<script
				id="breadcrumb-structured-data"
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe, controlled content
				dangerouslySetInnerHTML={{ __html: breadcrumbData }}
			/>
			<div className="flex min-h-screen flex-col">
				<Header />
				<main id="main-content" className="flex-1">
					<HeroSection
						title={t("hero.title")}
						subtitle={t("hero.subtitle")}
						description={t("hero.description")}
						primaryAction={{
							label: t("hero.getStarted"),
							href: "/#contact",
							showArrow: true,
						}}
						secondaryAction={{
							label: t("hero.learnMore"),
							href: "/#features",
						}}
					/>
					<FeatureGrid
						title={t("features.title")}
						description={t("features.description")}
						features={[
							{
								icon: "zap",
								title: t("features.lightningFast.title"),
								description: t("features.lightningFast.description"),
							},
							{
								icon: "shield",
								title: t("features.typeSafe.title"),
								description: t("features.typeSafe.description"),
							},
							{
								icon: "code",
								title: t("features.developerExperience.title"),
								description: t("features.developerExperience.description"),
							},
							{
								icon: "rocket",
								title: t("features.productionReady.title"),
								description: t("features.productionReady.description"),
							},
						]}
					/>
					<CTASection
						title={t("cta.title")}
						description={t("cta.description")}
						primaryAction={{
							label: t("cta.getStarted"),
							href: "/#contact",
							showArrow: true,
						}}
						secondaryAction={{
							label: t("cta.viewOnGitHub"),
							href:
								process.env.NEXT_PUBLIC_SOCIAL_GITHUB || "https://github.com",
							external: true,
						}}
					/>
					<ContactSection />
				</main>
				<Footer />
			</div>
		</>
	);
}
