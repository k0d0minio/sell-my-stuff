export const ITEM_PLACEHOLDER_IMAGE = "/images/item-placeholder.svg";

function normalizeBaseUrl(baseUrl?: string): string | undefined {
	if (!baseUrl) {
		return undefined;
	}
	return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function getItemPlaceholderImage(baseUrl?: string): string {
	const normalizedBase = normalizeBaseUrl(baseUrl);
	if (!normalizedBase || ITEM_PLACEHOLDER_IMAGE.startsWith("http")) {
		return ITEM_PLACEHOLDER_IMAGE;
	}

	return `${normalizedBase}${ITEM_PLACEHOLDER_IMAGE}`;
}

export function ensureItemImages(
	images?: string[] | null,
	options?: { baseUrl?: string },
): string[] {
	const validImages = Array.isArray(images)
		? images.filter((src) => typeof src === "string" && src.trim().length > 0)
		: [];

	if (validImages.length > 0) {
		return validImages;
	}

	const placeholder = options?.baseUrl
		? getItemPlaceholderImage(options.baseUrl)
		: ITEM_PLACEHOLDER_IMAGE;

	return [placeholder];
}
