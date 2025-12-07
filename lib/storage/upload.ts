import { put } from "@vercel/blob";

/**
 * Upload an image file to Vercel Blob Storage.
 * @param file - File to upload
 * @param filename - Optional custom filename
 * @returns URL of the uploaded image
 */
export async function uploadImage(
	file: File,
	filename?: string,
): Promise<string> {
	try {
		const blob = await put(filename || file.name, file, {
			access: "public",
			contentType: file.type,
		});

		return blob.url;
	} catch (error) {
		console.error("Failed to upload image:", error);
		throw new Error("Failed to upload image");
	}
}

/**
 * Upload multiple images to Vercel Blob Storage.
 * @param files - Array of files to upload
 * @param prefix - Optional prefix for filenames
 * @returns Array of URLs for uploaded images
 */
export async function uploadImages(
	files: File[],
	prefix?: string,
): Promise<string[]> {
	try {
		const uploadPromises = files.map((file, index) => {
			const filename = prefix
				? `${prefix}-${index}-${file.name}`
				: `${Date.now()}-${index}-${file.name}`;
			return uploadImage(file, filename);
		});

		return await Promise.all(uploadPromises);
	} catch (error) {
		console.error("Failed to upload images:", error);
		throw new Error("Failed to upload images");
	}
}

