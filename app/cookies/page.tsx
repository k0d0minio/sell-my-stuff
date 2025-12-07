import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/metadata";
import {
	createBreadcrumbListSchema,
	generateStructuredDataScript,
} from "@/lib/seo/structured-data";

export const metadata: Metadata = createMetadata({
	title: "Cookie Policy",
	description: "Cookie Policy for Second Hand Store - Learn about how we use cookies on our second-hand marketplace website.",
});

export default function CookiePolicyPage() {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

	const breadcrumbSchema = createBreadcrumbListSchema([
		{ name: "Home", url: siteUrl },
		{ name: "Cookie Policy", url: `${siteUrl}/cookies` },
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
								Cookie Policy
							</h1>
							<p className="mt-4 text-lg text-muted-foreground">
								Last updated: {new Date().toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>

							<div className="prose prose-lg dark:prose-invert mt-8 max-w-none">
								<section className="mb-8">
									<h2 className="text-2xl font-semibold mb-4">
										1. What Are Cookies
									</h2>
									<p>
										Cookies are small text files that are placed on your
										computer or mobile device when you visit a website. They are
										widely used to make websites work more efficiently and
										provide information to the owners of the site.
									</p>
								</section>
							</div>
						</div>
					</div>
				</main>
			</div>
		</>
	);
}

