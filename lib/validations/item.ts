import { z } from "zod";

export const itemCategorySchema = z.enum(["clothes", "decorations", "furniture"]);

export const itemSchema = z.object({
	title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
	description: z.string().min(10, "Description must be at least 10 characters"),
	price: z.number().positive("Price must be greater than 0"),
	category: itemCategorySchema,
	images: z.array(z.string().url()).min(1, "At least one image is required"),
});

export type ItemFormData = z.infer<typeof itemSchema>;

export const itemUpdateSchema = itemSchema.partial().extend({
	id: z.number().int().positive(),
});

export type ItemUpdateData = z.infer<typeof itemUpdateSchema>;

