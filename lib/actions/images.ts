"use server";

import { uploadImage, uploadImages } from "@/lib/storage/upload";

/**
 * Server action to upload a single image.
 * @param formData - FormData containing the image file
 * @returns URL of the uploaded image
 */
export async function uploadImageAction(
	formData: FormData,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
	try {
		const file = formData.get("file") as File | null;

		if (!file) {
			return { success: false, error: "No file provided" };
		}

		// Validate file type
		if (!file.type.startsWith("image/")) {
			return { success: false, error: "File must be an image" };
		}

		// Validate file size (max 10MB)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			return {
				success: false,
				error: "Image size must be less than 10MB",
			};
		}

		const url = await uploadImage(file);

		return { success: true, url };
	} catch (error) {
		console.error("Image upload error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to upload image",
		};
	}
}

/**
 * Server action to upload multiple images.
 * @param formData - FormData containing image files
 * @returns Array of URLs for uploaded images
 */
export async function uploadImagesAction(
	formData: FormData,
): Promise<
	| { success: true; urls: string[] }
	| { success: false; error: string }
> {
	try {
		const files = formData.getAll("files") as File[];

		if (files.length === 0) {
			return { success: false, error: "No files provided" };
		}

		// Validate all files
		const maxSize = 10 * 1024 * 1024; // 10MB
		for (const file of files) {
			if (!file.type.startsWith("image/")) {
				return { success: false, error: "All files must be images" };
			}
			if (file.size > maxSize) {
				return {
					success: false,
					error: "All images must be less than 10MB",
				};
			}
		}

		const urls = await uploadImages(files);

		return { success: true, urls };
	} catch (error) {
		console.error("Images upload error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to upload images",
		};
	}
}

