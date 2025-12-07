import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface SitemapRoute {
	url: string;
	lastModified?: Date | string;
	changeFrequency?:
		| "always"
		| "hourly"
		| "daily"
		| "weekly"
		| "monthly"
		| "yearly"
		| "never";
	priority?: number;
}

/**
 * Define your static routes here.
 * For dynamic routes, you can fetch data and generate entries programmatically.
 *
 * Priority guidelines:
 * - 1.0: Homepage
 * - 0.8: Important pages (About, Services, etc.)
 * - 0.6: Category/listing pages
 * - 0.4: Individual content pages
 * - 0.2: Archive/older content
 *
 * Change frequency guidelines:
 * - always: Real-time content (news, live feeds)
 * - hourly: Frequently updated content
 * - daily: Daily updated content (blogs, news)
 * - weekly: Weekly updated content
 * - monthly: Monthly updated content
 * - yearly: Rarely updated content (About, Contact)
 * - never: Archived content
 */
const staticRoutes: SitemapRoute[] = [
	{
		url: baseUrl,
		lastModified: new Date(),
		changeFrequency: "weekly",
		priority: 1.0,
	},
	{
		url: `${baseUrl}/privacy`,
		lastModified: new Date(),
		changeFrequency: "yearly",
		priority: 0.5,
	},
	{
		url: `${baseUrl}/terms`,
		lastModified: new Date(),
		changeFrequency: "yearly",
		priority: 0.5,
	},
	{
		url: `${baseUrl}/cookies`,
		lastModified: new Date(),
		changeFrequency: "yearly",
		priority: 0.5,
	},
];

// Generate routes for all locales
function generateLocalizedRoutes(): SitemapRoute[] {
	const routes: SitemapRoute[] = [];

	for (const locale of routing.locales) {
		routes.push(
			{
				url: `${baseUrl}/${locale}`,
				lastModified: new Date(),
				changeFrequency: "weekly",
				priority: 1.0,
			},
			{
				url: `${baseUrl}/${locale}/privacy`,
				lastModified: new Date(),
				changeFrequency: "yearly",
				priority: 0.5,
			},
			{
				url: `${baseUrl}/${locale}/terms`,
				lastModified: new Date(),
				changeFrequency: "yearly",
				priority: 0.5,
			},
			{
				url: `${baseUrl}/${locale}/cookies`,
				lastModified: new Date(),
				changeFrequency: "yearly",
				priority: 0.5,
			},
		);
	}

	return routes;
}

/**
 * Generate sitemap entries.
 * You can extend this to fetch dynamic routes from a CMS or database.
 */
async function getSitemapRoutes(): Promise<SitemapRoute[]> {
	// Include static routes and localized routes
	const routes = [...staticRoutes, ...generateLocalizedRoutes()];

	// Example: Fetch dynamic routes from a CMS or database
	// const dynamicRoutes = await fetchDynamicRoutes();
	// routes.push(...dynamicRoutes);

	return routes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const routes = await getSitemapRoutes();

	return routes.map((route) => ({
		url: route.url,
		lastModified:
			route.lastModified instanceof Date
				? route.lastModified
				: route.lastModified
					? new Date(route.lastModified)
					: new Date(),
		changeFrequency: route.changeFrequency || "weekly",
		priority: route.priority ?? 0.5,
	}));
}
