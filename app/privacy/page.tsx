import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/metadata";
import {
	createBreadcrumbListSchema,
	generateStructuredDataScript,
} from "@/lib/seo/structured-data";

export const metadata: Metadata = createMetadata({
	title: "Privacy Policy",
	description: "Privacy Policy for Second Hand Store - Learn how we handle your personal information when you browse and purchase second-hand items.",
});

export default function PrivacyPolicyPage() {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

	const breadcrumbSchema = createBreadcrumbListSchema([
		{ name: "Home", url: siteUrl },
		{ name: "Privacy Policy", url: `${siteUrl}/privacy` },
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
								Privacy Policy
							</h1>
							<p className="mt-4 text-lg text-muted-foreground">
								Last updated: {new Date().toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>

							<div className="prose prose-lg dark:prose-invert mt-8 max-w-none">
								<p>Privacy policy content goes here.</p>
							</div>
						</div>
					</div>
				</main>
			</div>
		</>
	);
}

