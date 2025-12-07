import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import {
	createBreadcrumbListSchema,
	generateStructuredDataScript,
} from "@/lib/seo/structured-data";

export const metadata: Metadata = createMetadata({
	title: "Terms of Service",
	description: "Terms of Service for Second Hand Store - Terms and conditions for browsing and purchasing second-hand items.",
});

export default function TermsOfServicePage() {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

	const breadcrumbSchema = createBreadcrumbListSchema([
		{ name: "Home", url: siteUrl },
		{ name: "Terms of Service", url: `${siteUrl}/terms` },
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
								Terms of Service
							</h1>
							<p className="mt-4 text-lg text-muted-foreground">
								Last updated: {new Date().toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>

							<div className="prose prose-lg dark:prose-invert mt-8 max-w-none">
								<p>Terms of service content goes here.</p>
							</div>
						</div>
					</div>
				</main>
			</div>
		</>
	);
}

