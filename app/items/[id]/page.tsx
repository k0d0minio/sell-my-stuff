import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ImageGallery } from "@/components/items/image-gallery";
import { ReservationForm } from "@/components/reservation-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getItemById } from "@/lib/actions/items";
import { formatCurrency } from "@/lib/currency";
import {
	createBreadcrumbListSchema,
	createProductSchema,
	generateStructuredDataScript,
} from "@/lib/seo/structured-data";
import type { Metadata } from "next";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const item = await getItemById(Number.parseInt(id, 10));

	if (!item) {
		return {
			title: "Item Not Found",
		};
	}

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

	return {
		title: item.title,
		description: item.description,
		openGraph: {
			title: item.title,
			description: item.description,
			images: item.images.length > 0 ? [item.images[0]] : [],
			url: `${siteUrl}/items/${id}`,
		},
	};
}

export default async function ItemDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const itemId = Number.parseInt(id, 10);
	if (Number.isNaN(itemId)) {
		notFound();
	}

	const item = await getItemById(itemId);
	if (!item) {
		notFound();
	}

	const categoryLabels: Record<string, string> = {
		clothes: "Clothes",
		decorations: "Decorations",
		furniture: "Furniture",
	};

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

	// Create structured data
	const productSchema = createProductSchema({
		name: item.title,
		description: item.description,
		price: item.price,
		image: item.images,
		category: categoryLabels[item.category] || item.category,
	});

	const breadcrumbSchema = createBreadcrumbListSchema([
		{ name: "Home", url: siteUrl },
		{ name: item.title, url: `${siteUrl}/items/${id}` },
	]);

	const structuredData = generateStructuredDataScript([
		productSchema,
		breadcrumbSchema,
	]);

	return (
		<>
			<script
				id="product-structured-data"
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe, controlled content
				dangerouslySetInnerHTML={{ __html: structuredData }}
			/>
			<div className="flex min-h-screen flex-col">
				<Header />
				<main id="main-content" className="flex-1 bg-gray-50">
					<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
							<div>
								<ImageGallery images={item.images} title={item.title} />
							</div>
							<div className="space-y-6">
								<div>
									<h1 className="text-3xl font-bold text-gray-900">
										{item.title}
									</h1>
									<p className="mt-2 text-lg text-gray-500">
										{categoryLabels[item.category] || item.category}
									</p>
									<p className="mt-4 text-3xl font-bold text-gray-900">
										{formatCurrency(item.price)}
									</p>
								</div>
								<Separator />
								<div>
									<h2 className="text-xl font-semibold text-gray-900">
										Description
									</h2>
									<p className="mt-2 text-gray-600 whitespace-pre-wrap">
										{item.description}
									</p>
								</div>
								<Separator />
								<Card>
									<CardHeader>
										<CardTitle>Reserve This Item</CardTitle>
									</CardHeader>
									<CardContent>
										<ReservationForm itemId={item.id} itemTitle={item.title} />
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</main>
				<Footer />
			</div>
		</>
	);
}

