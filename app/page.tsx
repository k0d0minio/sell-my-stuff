import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ItemsList } from "@/components/items/items-list";
import { createMetadata } from "@/lib/metadata";
import {
	createBreadcrumbListSchema,
	generateStructuredDataScript,
} from "@/lib/seo/structured-data";

export const metadata: Metadata = createMetadata({
	title: "Second Hand Store",
	description: "Find great deals on second-hand items",
});

export default function Home() {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

	const breadcrumbSchema = createBreadcrumbListSchema([
		{ name: "Home", url: siteUrl },
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
				<main id="main-content" className="flex-1 bg-gray-50">
					<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
						<div className="mb-8">
							<h1 className="text-3xl font-bold text-gray-900">
								Browse Items
							</h1>
							<p className="mt-2 text-gray-600">
								Find great deals on second-hand items
							</p>
						</div>
						<Suspense
							fallback={
								<div className="text-center py-12">
									<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
									<p className="mt-4 text-gray-600">Loading items...</p>
								</div>
							}
						>
							<ItemsList />
						</Suspense>
					</div>
				</main>
				<Footer />
			</div>
		</>
	);
}

