import { DEFAULT_CURRENCY } from "@/lib/currency";

// JSON-LD Schema.org types
type WithContext<T> = T & { "@context": "https://schema.org" };

interface Organization {
	"@type": "Organization";
	name: string;
	url: string;
	logo: string;
	sameAs?: string[];
}

interface WebSite {
	"@type": "WebSite";
	name: string;
	url: string;
	description: string;
	potentialAction?: {
		"@type": "SearchAction";
		target: {
			"@type": "EntryPoint";
			urlTemplate: string;
		};
		"query-input": string;
	};
}

interface BreadcrumbList {
	"@type": "BreadcrumbList";
	itemListElement: Array<{
		"@type": "ListItem";
		position: number;
		name: string;
		item: string;
	}>;
}

interface Product {
	"@type": "Product";
	name: string;
	description: string;
	image?: string[];
	offers: {
		"@type": "Offer";
		price: string;
		priceCurrency: string;
		availability: string;
	};
	category?: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Second Hand Store";
const organizationName =
	process.env.NEXT_PUBLIC_ORGANIZATION_NAME ||
	process.env.NEXT_PUBLIC_SITE_NAME ||
	"Second Hand Store";
const organizationUrl =
	process.env.NEXT_PUBLIC_ORGANIZATION_URL ||
	process.env.NEXT_PUBLIC_SITE_URL ||
	"http://localhost:3000";
const organizationLogo =
	process.env.NEXT_PUBLIC_ORGANIZATION_LOGO || `${siteUrl}/logo.png`;
const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@yourusername";

/**
 * Options for creating an Organization schema.
 * @public
 */
export interface OrganizationSchemaOptions {
	/** Organization name. Falls back to NEXT_PUBLIC_ORGANIZATION_NAME or NEXT_PUBLIC_SITE_NAME */
	name?: string;
	/** Organization URL. Falls back to NEXT_PUBLIC_ORGANIZATION_URL or NEXT_PUBLIC_SITE_URL */
	url?: string;
	/** Organization logo URL. Falls back to NEXT_PUBLIC_ORGANIZATION_LOGO or /logo.png */
	logo?: string;
	/** Array of social media profile URLs */
	sameAs?: string[];
}

/**
 * Creates a JSON-LD Organization schema for structured data.
 *
 * This schema helps search engines understand your organization's identity and social presence.
 * It's automatically included in the root layout but can be customized per-page.
 *
 * @param options - Configuration options for the organization schema
 * @returns A JSON-LD Organization schema object with @context
 *
 * @example
 * ```tsx
 * const schema = createOrganizationSchema({
 *   name: "Acme Corp",
 *   url: "https://acme.com",
 *   logo: "https://acme.com/logo.png",
 *   sameAs: ["https://twitter.com/acme", "https://linkedin.com/company/acme"]
 * });
 * ```
 */
export function createOrganizationSchema(
	options: OrganizationSchemaOptions = {},
): WithContext<Organization> {
	const name = options.name || organizationName;
	const url = options.url || organizationUrl;
	const logo = options.logo || organizationLogo;
	const sameAs: string[] = options.sameAs || [];

	// Add social media links if available
	if (twitterHandle && twitterHandle !== "@yourusername") {
		sameAs.push(`https://twitter.com/${twitterHandle.replace("@", "")}`);
	}

	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name,
		url,
		logo,
		...(sameAs.length > 0 && { sameAs }),
	};
}

/**
 * Options for creating a WebSite schema.
 * @public
 */
export interface WebSiteSchemaOptions {
	/** Website name. Falls back to NEXT_PUBLIC_SITE_NAME */
	name?: string;
	/** Website URL. Falls back to NEXT_PUBLIC_SITE_URL */
	url?: string;
	/** Website description. Falls back to NEXT_PUBLIC_SITE_DESCRIPTION */
	description?: string;
	/** Search action configuration for site search functionality */
	potentialAction?: {
		/** URL template for search (e.g., "https://example.com/search?q={search_term_string}") */
		target: string;
		/** Query input specification (e.g., "required name=search_term_string") */
		queryInput: string;
	};
}

/**
 * Creates a JSON-LD WebSite schema for structured data.
 *
 * This schema helps search engines understand your website and enables search action
 * functionality in search results.
 *
 * @param options - Configuration options for the website schema
 * @returns A JSON-LD WebSite schema object with @context
 *
 * @example
 * ```tsx
 * const schema = createWebSiteSchema({
 *   name: "My Website",
 *   url: "https://example.com",
 *   description: "A great website",
 *   potentialAction: {
 *     target: "https://example.com/search?q={search_term_string}",
 *     queryInput: "required name=search_term_string"
 *   }
 * });
 * ```
 */
export function createWebSiteSchema(
	options: WebSiteSchemaOptions = {},
): WithContext<WebSite> {
	const name = options.name || siteName;
	const url = options.url || siteUrl;
	const description =
		options.description ||
		process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
		"Find great deals on second-hand items";

	const schema: WithContext<WebSite> = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name,
		url,
		description,
	};

	// Add search action if provided
	if (options.potentialAction) {
		schema.potentialAction = {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: options.potentialAction.target,
			},
			"query-input": options.potentialAction.queryInput,
		};
	}

	return schema;
}

/**
 * A single breadcrumb item in the navigation hierarchy.
 * @public
 */
export interface BreadcrumbItem {
	/** Display name of the breadcrumb item */
	name: string;
	/** URL of the breadcrumb item */
	url: string;
}

/**
 * Creates a JSON-LD BreadcrumbList schema for structured data.
 *
 * This schema helps search engines understand your site's navigation hierarchy
 * and can display breadcrumbs in search results.
 *
 * @param items - Array of breadcrumb items in hierarchical order
 * @returns A JSON-LD BreadcrumbList schema object with @context
 *
 * @example
 * ```tsx
 * const breadcrumbs = createBreadcrumbListSchema([
 *   { name: "Home", url: "https://example.com" },
 *   { name: "Products", url: "https://example.com/products" },
 *   { name: "Widget", url: "https://example.com/products/widget" }
 * ]);
 * ```
 */
export function createBreadcrumbListSchema(
	items: BreadcrumbItem[],
): WithContext<BreadcrumbList> {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};
}

/**
 * Generates a JSON string from one or more structured data schemas.
 *
 * This function formats schemas for injection into HTML as JSON-LD script tags.
 * If a single schema is provided, it returns just that schema. If multiple are provided,
 * it returns an array of schemas.
 *
 * @param schemas - One or more structured data schemas to serialize
 * @returns A JSON string ready for use in a script tag with type="application/ld+json"
 *
 * @example
 * ```tsx
 * const orgSchema = createOrganizationSchema();
 * const siteSchema = createWebSiteSchema();
 * const json = generateStructuredDataScript([orgSchema, siteSchema]);
 * // Use in: <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
 * ```
 */
/**
 * Options for creating a Product schema.
 * @public
 */
export interface ProductSchemaOptions {
	/** Product name */
	name: string;
	/** Product description */
	description: string;
	/** Product images (URLs) */
	image?: string[];
	/** Product price */
	price: number;
	/** Price currency (default: "EUR") */
	priceCurrency?: string;
	/** Product category */
	category?: string;
	/** Product availability (default: "https://schema.org/InStock") */
	availability?: string;
}

/**
 * Creates a JSON-LD Product schema for structured data.
 *
 * This schema helps search engines understand product information and can enable
 * rich snippets in search results.
 *
 * @param options - Configuration options for the product schema
 * @returns A JSON-LD Product schema object with @context
 *
 * @example
 * ```tsx
 * const schema = createProductSchema({
 *   name: "Vintage Chair",
 *   description: "A beautiful vintage chair",
 *   price: 150.00,
 *   image: ["https://example.com/chair.jpg"],
 *   category: "Furniture"
 * });
 * ```
 */
export function createProductSchema(
	options: ProductSchemaOptions,
): WithContext<Product> {
	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: options.name,
		description: options.description,
		...(options.image && options.image.length > 0 && { image: options.image }),
		offers: {
			"@type": "Offer",
			price: options.price.toFixed(2),
			priceCurrency: options.priceCurrency || DEFAULT_CURRENCY,
			availability:
				options.availability || "https://schema.org/InStock",
		},
		...(options.category && { category: options.category }),
	};
}

export function generateStructuredDataScript(
	schemas: Array<WithContext<Organization | WebSite | BreadcrumbList | Product>>,
): string {
	return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas, null, 0);
}
