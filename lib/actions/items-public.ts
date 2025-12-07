"use server";

import { query } from "@/lib/db/client";
import type { Item } from "@/lib/db/types";

export interface ItemFilters {
	search?: string;
	category?: "clothes" | "decorations" | "furniture";
}

/**
 * Get items for public display with optional filtering.
 */
export async function getPublicItems(
	filters?: ItemFilters,
): Promise<Item[]> {
	try {
		let queryText = `
			SELECT id, title, description, price, category, images, created_at, updated_at
			FROM items
			WHERE 1=1
		`;
		const params: unknown[] = [];
		let paramIndex = 1;

		if (filters?.category) {
			queryText += ` AND category = $${paramIndex++}`;
			params.push(filters.category);
		}

		if (filters?.search) {
			queryText += ` AND (
				to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', $${paramIndex}) OR
				title ILIKE $${paramIndex + 1} OR
				description ILIKE $${paramIndex + 1}
			)`;
			const searchTerm = filters.search;
			params.push(searchTerm);
			params.push(`%${searchTerm}%`);
			paramIndex += 2;
		}

		queryText += ` ORDER BY created_at DESC`;

		const items = await query<Item>(queryText, params);

		// Convert images JSONB to array and price to number
		return items.map((item) => ({
			...item,
			price: typeof item.price === "string" ? Number.parseFloat(item.price) : item.price,
			images: Array.isArray(item.images) ? item.images : [],
		}));
	} catch (error) {
		console.error("Get public items error:", error);
		return [];
	}
}

