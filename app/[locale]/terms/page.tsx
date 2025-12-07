import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
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
	const t = await getTranslations({ locale, namespace: "terms" });
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Website Starter";

	return createMetadata({
		title: t("title"),
		description: `Terms of Service for ${siteName}. Read our terms and conditions for using our website and services.`,
		openGraph: {
			title: `${t("title")} | ${siteName}`,
			description: `Terms of Service for ${siteName}. Read our terms and conditions for using our website and services.`,
			url: `${siteUrl}/${locale}/terms`,
		},
		twitter: {
			title: `${t("title")} | ${siteName}`,
			description: `Terms of Service for ${siteName}. Read our terms and conditions for using our website and services.`,
		},
	});
}

export default async function TermsOfServicePage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations();
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
	const businessName =
		process.env.NEXT_PUBLIC_BUSINESS_NAME ||
		process.env.NEXT_PUBLIC_ORGANIZATION_NAME ||
		process.env.NEXT_PUBLIC_SITE_NAME ||
		"Website Starter";
	const businessEmail =
		process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "legal@example.com";

	const breadcrumbSchema = createBreadcrumbListSchema([
		{ name: t("common.home"), url: `${siteUrl}/${locale}` },
		{ name: t("terms.breadcrumb"), url: `${siteUrl}/${locale}/terms` },
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
				<main id="main-content" className="flex-1">
					<div className="container px-4 py-12 md:py-16">
						<div className="mx-auto max-w-4xl">
							<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
								{t("terms.title")}
							</h1>
							<p className="mt-4 text-lg text-muted-foreground">
								{t("terms.lastUpdated")}{" "}
								{new Date().toLocaleDateString(locale, {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>

							<div className="prose prose-lg dark:prose-invert mt-8 max-w-none">
								<section className="mb-8">
									<h2 className="text-2xl font-semibold mb-4">
										1. Agreement to Terms
									</h2>
									<p>
										By accessing or using {siteUrl} (the "Service"), you agree
										to be bound by these Terms of Service ("Terms"). If you
										disagree with any part of these Terms, then you may not
										access the Service.
									</p>
									<p>
										These Terms apply to all visitors, users, and others who
										access or use the Service.
									</p>
								</section>

								<section className="mb-8">
									<h2 className="text-2xl font-semibold mb-4">
										2. Information We Collect
									</h2>
									<h3 className="text-xl font-semibold mb-3">
										2.1 Information You Provide
									</h3>
									<p>
										We may collect information that you voluntarily provide to
										us, including:
									</p>
									<ul>
										<li>
											Name and contact information (email address, phone number)
										</li>
										<li>Account registration information</li>
										<li>
											Payment information (processed through secure third-party
											providers)
										</li>
										<li>
											Communications with us (customer support inquiries,
											feedback)
										</li>
										<li>Any other information you choose to provide</li>
									</ul>

									<h3 className="text-xl font-semibold mb-3 mt-6">
										2.2 Automatically Collected Information
									</h3>
									<p>
										When you access the Service, we may automatically collect
										certain information, including:
									</p>
									<ul>
										<li>
											Device information (IP address, browser type, operating
											system)
										</li>
										<li>
											Usage data (pages visited, time spent, click patterns)
										</li>
										<li>Cookies and similar tracking technologies</li>
										<li>
											Location data (if permitted by your device settings)
										</li>
									</ul>
								</section>

								<section className="mb-8">
									<h2 className="text-2xl font-semibold mb-4">
										3. How We Use Your Information
									</h2>
									<p>
										We use the information we collect for various purposes,
										including:
									</p>
									<ul>
										<li>To provide, maintain, and improve our Service</li>
										<li>
											To process transactions and send related information
										</li>
										<li>
											To send you technical notices, updates, and support
											messages
										</li>
										<li>
											To respond to your comments, questions, and requests
										</li>
										<li>
											To monitor and analyze trends, usage, and activities
										</li>
										<li>
											To detect, prevent, and address technical issues and
											security threats
										</li>
										<li>
											To personalize your experience and deliver content
											relevant to your interests
										</li>
										<li>To comply with legal obligations</li>
									</ul>
								</section>

								<section className="mb-8">
									<h2 className="text-2xl font-semibold mb-4">
										4. Information Sharing and Disclosure
									</h2>
									<p>
										We do not sell, trade, or rent your personal information to
										third parties. We may share your information in the
										following circumstances:
									</p>
									<ul>
										<li>
											<strong>Service Providers:</strong> We may share
											information with third-party service providers who perform
											services on our behalf (e.g., hosting, analytics, payment
											processing)
										</li>
										<li>
											<strong>Legal Requirements:</strong> We may disclose
											information if required by law or in response to valid
											requests by public authorities
										</li>
										<li>
											<strong>Business Transfers:</strong> In the event of a
											merger, acquisition, or sale of assets, your information
											may be transferred
										</li>
										<li>
											<strong>With Your Consent:</strong> We may share
											information with your explicit consent
										</li>
									</ul>
								</section>

								<section className="mb-8">
									<h2 className="text-2xl font-semibold mb-4">
										5. Cookies and Tracking
									</h2>
									<p>
										We use cookies and similar tracking technologies to track
										activity on our Service and hold certain information. You
										can instruct your browser to refuse all cookies or to
										indicate when a cookie is being sent.
									</p>
									<p>
										For more information about our use of cookies, please see
										our{" "}
										<Link
											href="/cookies"
											className="text-primary hover:underline"
										>
											Cookie Policy
										</Link>
										.
									</p>
								</section>

								<section className="mb-8">
									<h2 className="text-2xl font-semibold mb-4">
										6. Data Security
									</h2>
									<p>
										We implement appropriate technical and organizational
										security measures to protect your personal information.
										However, no method of transmission over the Internet or
										electronic storage is 100% secure, and we cannot guarantee
										absolute security.
									</p>
								</section>

								<section className="mb-8">
									<h2 className="text-2xl font-semibold mb-4">
										7. Your Rights (GDPR)
									</h2>
									<p>
										If you are located in the European Economic Area (EEA), you
										have certain data protection rights under the General Data
										Protection Regulation (GDPR):
									</p>
									<ul>
										<li>
											<strong>Right to Access:</strong> You have the right to
											request copies of your personal data
										</li>
										<li>
											<strong>Right to Rectification:</strong> You have the
											right to request correction of inaccurate or incomplete
											data
										</li>
										<li>
											<strong>Right to Erasure:</strong> You have the right to
											request deletion of your personal data under certain
											circumstances
										</li>
										<li>
											<strong>Right to Restrict Processing:</strong> You have
											the right to request restriction of processing of your
											personal data
										</li>
										<li>
											<strong>Right to Data Portability:</strong> You have the
											right to request transfer of your data to another service
										</li>
										<li>
											<strong>Right to Object:</strong> You have the right to
											object to processing of your personal data
										</li>
									</ul>
									<p>
										To exercise these rights, please contact us at{" "}
										<a
											href={`mailto:${businessEmail}`}
											className="text-primary hover:underline"
										>
											{businessEmail}
										</a>
										.
									</p>
								</section>

								<section className="mb-8">
									<h2 className="text-2xl font-semibold mb-4">
										8. Children's Privacy
									</h2>
									<p>
										Our Service is not intended for children under the age of 13
										(or 16 in the EEA). We do not knowingly collect personal
										information from children. If you become aware that a child
										has provided us with personal information, please contact us
										immediately.
									</p>
								</section>

								<section className="mb-8">
									<h2 className="text-2xl font-semibold mb-4">
										9. Changes to This Privacy Policy
									</h2>
									<p>
										We may update our Privacy Policy from time to time. We will
										notify you of any changes by posting the new Privacy Policy
										on this page and updating the "Last updated" date.
									</p>
									<p>
										You are advised to review this Privacy Policy periodically
										for any changes. Changes to this Privacy Policy are
										effective when they are posted on this page.
									</p>
								</section>

								<section className="mb-8">
									<h2 className="text-2xl font-semibold mb-4">
										10. Contact Us
									</h2>
									<p>
										If you have any questions about this Privacy Policy, please
										contact us:
									</p>
									<ul>
										<li>
											Email:{" "}
											<a
												href={`mailto:${businessEmail}`}
												className="text-primary hover:underline"
											>
												{businessEmail}
											</a>
										</li>
										{businessName && <li>Company: {businessName}</li>}
									</ul>
								</section>
							</div>
						</div>
					</div>
				</main>
			</div>
		</>
	);
}
