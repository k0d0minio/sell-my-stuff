import { del } from "@vercel/blob";

/**
 * Delete an image from Vercel Blob Storage.
 * @param url - URL of the image to delete
 */
export async function deleteImage(url: string): Promise<void> {
	try {
		await del(url);
	} catch (error) {
		console.error("Failed to delete image:", error);
		// Don't throw - deletion failures shouldn't break the flow
	}
}

/**
 * Delete multiple images from Vercel Blob Storage.
 * @param urls - Array of image URLs to delete
 */
export async function deleteImages(urls: string[]): Promise<void> {
	try {
		const deletePromises = urls.map((url) => deleteImage(url));
		await Promise.all(deletePromises);
	} catch (error) {
		console.error("Failed to delete images:", error);
		// Don't throw - deletion failures shouldn't break the flow
	}
}

