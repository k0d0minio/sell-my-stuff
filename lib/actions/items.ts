"use server";

import { redirect } from "next/navigation";
import { query, queryOne } from "@/lib/db/client";
import { deleteImages } from "@/lib/storage/delete";
import { uploadImages } from "@/lib/storage/upload";
import { itemSchema, type ItemFormData } from "@/lib/validations/item";
import type { Item } from "@/lib/db/types";

/**
 * Create a new item.
 */
export async function createItem(
	data: ItemFormData,
): Promise<{ success: true; id: number } | { success: false; error: string }> {
	try {
		const validation = itemSchema.safeParse(data);
		if (!validation.success) {
			return {
				success: false,
				error: validation.error.errors[0]?.message || "Invalid item data",
			};
		}

		const { title, description, price, category, images } = validation.data;

		const result = await queryOne<{ id: number }>(
			`
			INSERT INTO items (title, description, price, category, images, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			RETURNING id
		`,
			[title, description, price, category, JSON.stringify(images)],
		);

		if (!result) {
			return { success: false, error: "Failed to create item" };
		}

		return { success: true, id: result.id };
	} catch (error) {
		console.error("Create item error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to create item",
		};
	}
}

/**
 * Get all items (for admin).
 */
export async function getAllItems(): Promise<Item[]> {
	try {
		const items = await query<Item>(
			`
			SELECT id, title, description, price, category, images, created_at, updated_at
			FROM items
			ORDER BY created_at DESC
		`,
		);

		// Convert images JSONB to array and price to number
		return items.map((item) => ({
			...item,
			price: typeof item.price === "string" ? Number.parseFloat(item.price) : item.price,
			images: Array.isArray(item.images) ? item.images : [],
		}));
	} catch (error) {
		console.error("Get all items error:", error);
		return [];
	}
}

/**
 * Get a single item by ID.
 */
export async function getItemById(id: number): Promise<Item | null> {
	try {
		const item = await queryOne<Item>(
			`
			SELECT id, title, description, price, category, images, created_at, updated_at
			FROM items
			WHERE id = $1
		`,
			[id],
		);

		if (!item) {
			return null;
		}

		return {
			...item,
			price: typeof item.price === "string" ? Number.parseFloat(item.price) : item.price,
			images: Array.isArray(item.images) ? item.images : [],
		};
	} catch (error) {
		console.error("Get item error:", error);
		return null;
	}
}

/**
 * Update an item.
 */
export async function updateItem(
	id: number,
	data: Partial<ItemFormData>,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		const updates: string[] = [];
		const values: unknown[] = [];
		let paramIndex = 1;

		if (data.title !== undefined) {
			updates.push(`title = $${paramIndex++}`);
			values.push(data.title);
		}
		if (data.description !== undefined) {
			updates.push(`description = $${paramIndex++}`);
			values.push(data.description);
		}
		if (data.price !== undefined) {
			updates.push(`price = $${paramIndex++}`);
			values.push(data.price);
		}
		if (data.category !== undefined) {
			updates.push(`category = $${paramIndex++}`);
			values.push(data.category);
		}
		if (data.images !== undefined) {
			updates.push(`images = $${paramIndex++}::jsonb`);
			values.push(JSON.stringify(data.images));
		}

		if (updates.length === 0) {
			return { success: false, error: "No fields to update" };
		}

		updates.push(`updated_at = CURRENT_TIMESTAMP`);
		values.push(id);

		await query(
			`
			UPDATE items
			SET ${updates.join(", ")}
			WHERE id = $${paramIndex}
		`,
			values,
		);

		return { success: true };
	} catch (error) {
		console.error("Update item error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to update item",
		};
	}
}

/**
 * Delete an item and its images.
 */
export async function deleteItem(
	id: number,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		// Get item to retrieve image URLs
		const item = await getItemById(id);
		if (!item) {
			return { success: false, error: "Item not found" };
		}

		// Delete images from storage
		if (item.images.length > 0) {
			await deleteImages(item.images);
		}

		// Delete item from database (cascade will delete reservations)
		await query("DELETE FROM items WHERE id = $1", [id]);

		return { success: true };
	} catch (error) {
		console.error("Delete item error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to delete item",
		};
	}
}

/**
 * Server action to handle item creation with image uploads.
 */
export async function createItemWithImages(
	formData: FormData,
): Promise<{ success: true; id: number } | { success: false; error: string }> {
	try {
		// Extract form data
		const title = formData.get("title") as string;
		const description = formData.get("description") as string;
		const price = Number.parseFloat(formData.get("price") as string);
		const category = formData.get("category") as string;
		const imageFiles = formData.getAll("images") as File[];

		// Upload images
		const validImageFiles = imageFiles.filter(
			(file) => file instanceof File && file.size > 0,
		);

		if (validImageFiles.length === 0) {
			return { success: false, error: "At least one image is required" };
		}

		const imageUrls = await uploadImages(validImageFiles, `item-${Date.now()}`);

		// Create item
		const result = await createItem({
			title,
			description,
			price,
			category: category as "clothes" | "decorations" | "furniture",
			images: imageUrls,
		});

		if (!result.success) {
			// Clean up uploaded images if item creation fails
			await deleteImages(imageUrls);
			return result;
		}

		return result;
	} catch (error) {
		console.error("Create item with images error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to create item",
		};
	}
}

/**
 * Server action to handle item updates with image uploads and deletions.
 */
export async function updateItemWithImages(
	formData: FormData,
): Promise<{ success: true } | { success: false; error: string }> {
	try {
		// Extract form data
		const id = Number.parseInt(formData.get("id") as string, 10);
		const title = formData.get("title") as string;
		const description = formData.get("description") as string;
		const price = Number.parseFloat(formData.get("price") as string);
		const category = formData.get("category") as string;
		const imageFiles = formData.getAll("images") as File[];
		const existingImagesToKeep = formData.getAll("existingImages") as string[];

		if (Number.isNaN(id)) {
			return { success: false, error: "Invalid item ID" };
		}

		// Get current item to determine which images to delete
		const currentItem = await getItemById(id);
		if (!currentItem) {
			return { success: false, error: "Item not found" };
		}

		// Determine which existing images to delete (ones not in the keep list)
		const imagesToDelete = currentItem.images.filter(
			(url) => !existingImagesToKeep.includes(url),
		);

		// Upload new images
		const validImageFiles = imageFiles.filter(
			(file) => file instanceof File && file.size > 0,
		);

		let newImageUrls: string[] = [];
		if (validImageFiles.length > 0) {
			newImageUrls = await uploadImages(validImageFiles, `item-${id}-${Date.now()}`);
		}

		// Combine kept existing images with new images
		const allImages = [...existingImagesToKeep, ...newImageUrls];

		if (allImages.length === 0) {
			// Clean up newly uploaded images if no images remain
			if (newImageUrls.length > 0) {
				await deleteImages(newImageUrls);
			}
			return { success: false, error: "At least one image is required" };
		}

		// Update item
		const result = await updateItem(id, {
			title,
			description,
			price,
			category: category as "clothes" | "decorations" | "furniture",
			images: allImages,
		});

		if (!result.success) {
			// Clean up newly uploaded images if update fails
			if (newImageUrls.length > 0) {
				await deleteImages(newImageUrls);
			}
			return result;
		}

		// Delete removed images from storage
		if (imagesToDelete.length > 0) {
			await deleteImages(imagesToDelete);
		}

		return { success: true };
	} catch (error) {
		console.error("Update item with images error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to update item",
		};
	}
}

