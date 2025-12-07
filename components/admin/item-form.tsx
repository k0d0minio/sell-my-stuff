"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/image-uploader";
import { createItemWithImages, updateItemWithImages } from "@/lib/actions/items";
import type { Item } from "@/lib/db/types";
import { itemSchema, type ItemFormData } from "@/lib/validations/item";

type FormStatus = {
	type: "success" | "error" | null;
	message: string;
};

async function createFormAction(
	_prevState: FormStatus | null,
	formData: FormData,
): Promise<FormStatus> {
	try {
		const result = await createItemWithImages(formData);

		if (result.success) {
			return {
				type: "success",
				message: "success",
			};
		}

		return {
			type: "error",
			message: result.error || "error",
		};
	} catch (error) {
		return {
			type: "error",
			message: error instanceof Error ? error.message : "error",
		};
	}
}

async function updateFormAction(
	_prevState: FormStatus | null,
	formData: FormData,
): Promise<FormStatus> {
	try {
		const result = await updateItemWithImages(formData);

		if (result.success) {
			return {
				type: "success",
				message: "success",
			};
		}

		return {
			type: "error",
			message: result.error || "error",
		};
	} catch (error) {
		return {
			type: "error",
			message: error instanceof Error ? error.message : "error",
		};
	}
}

interface ItemFormProps {
	item?: Item;
}

export function ItemForm({ item }: ItemFormProps) {
	const router = useRouter();
	const isEditMode = !!item;
	const [state, formActionWithState] = useActionState(
		isEditMode ? updateFormAction : createFormAction,
		null,
	);
	const [isPending, startTransition] = useTransition();
	
	// Track existing images (URLs) separately from new file uploads
	const [existingImages, setExistingImages] = useState<string[]>(item?.images || []);
	const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
	const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

	// Combined previews for display (existing URLs + new file previews)
	const allPreviews = [...existingImages, ...newImagePreviews];

	const form = useForm<ItemFormData>({
		resolver: zodResolver(itemSchema),
		defaultValues: {
			title: item?.title || "",
			description: item?.description || "",
			price: item?.price || 0,
			category: item?.category || "clothes",
			images: item?.images || [],
		},
	});

	// Initialize existing images when item is provided
	useEffect(() => {
		if (item?.images) {
			setExistingImages(item.images);
			form.setValue("images", item.images);
		}
	}, [item, form]);

	// Submit form with image files
	async function onSubmit(data: ItemFormData) {
		const formData = new FormData();
		
		if (isEditMode) {
			formData.append("id", item.id.toString());
		}
		
		formData.append("title", data.title);
		formData.append("description", data.description);
		formData.append("price", data.price.toString());
		formData.append("category", data.category);

		if (isEditMode) {
			// For updates: append existing images to keep and new image files
			for (const url of existingImages) {
				formData.append("existingImages", url);
			}
			for (const file of newImageFiles) {
				formData.append("images", file);
			}
		} else {
			// For creates: append new image files only
			for (const file of newImageFiles) {
				formData.append("images", file);
			}
		}

		startTransition(() => {
			formActionWithState(formData);
		});
	}

	// Handle image changes from ImageUploader
	function handleImagesChange(files: File[], previews: string[]) {
		// Separate existing URLs from new file previews
		// Existing URLs start with http/https, new files have data: URLs
		const keptExisting: string[] = [];
		const newFiles: File[] = [];
		const newPreviews: string[] = [];
		let fileIndex = 0;

		previews.forEach((preview) => {
			// If preview is a data URL (starts with data:), it's a new file
			if (preview.startsWith("data:")) {
				if (fileIndex < files.length) {
					newFiles.push(files[fileIndex]);
					newPreviews.push(preview);
					fileIndex++;
				}
			} else if (existingImages.includes(preview)) {
				// If it's an existing URL that we still have, keep it
				keptExisting.push(preview);
			}
		});

		setNewImageFiles(newFiles);
		setNewImagePreviews(newPreviews);
		setExistingImages(keptExisting);
		
		// Update form validation with combined images
		const allImages = [...keptExisting, ...newPreviews];
		form.setValue("images", allImages);
	}

	// Redirect on success
	useEffect(() => {
		if (state?.type === "success") {
			form.reset();
			setNewImageFiles([]);
			setNewImagePreviews([]);
			setExistingImages([]);
			// Small delay to show success message
			setTimeout(() => {
				router.push("/admin/items");
			}, 1000);
		}
	}, [state, form, router]);

	return (
		<div className="w-full max-w-4xl mx-auto">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input placeholder="Item title" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Describe your item..."
										className="min-h-[120px]"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="price"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Price</FormLabel>
									<FormControl>
										<Input
											type="number"
											step="0.01"
											min="0"
											placeholder="0.00"
											{...field}
											onChange={(e) =>
												field.onChange(Number.parseFloat(e.target.value) || 0)
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="category"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select category" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="clothes">Clothes</SelectItem>
											<SelectItem value="decorations">Decorations</SelectItem>
											<SelectItem value="furniture">Furniture</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="images"
						render={() => (
							<FormItem>
								<FormLabel>Images</FormLabel>
								<FormControl>
									<ImageUploader
										images={newImageFiles}
										previews={allPreviews}
										onImagesChange={handleImagesChange}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{state?.type && (
						<Alert
							variant={state.type === "error" ? "destructive" : "default"}
							role="alert"
							aria-live={state.type === "error" ? "assertive" : "polite"}
						>
							{state.type === "success" ? (
								<CheckCircle2 className="h-4 w-4" />
							) : (
								<AlertCircle className="h-4 w-4" />
							)}
							<AlertDescription>
								{state.message === "success"
									? isEditMode
										? "Item updated successfully!"
										: "Item saved successfully!"
									: state.message === "error"
										? isEditMode
											? "Failed to update item"
											: "Failed to save item"
										: state.message}
							</AlertDescription>
						</Alert>
					)}

					<div className="flex justify-end space-x-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{isEditMode ? "Updating..." : "Saving..."}
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									{isEditMode ? "Update Item" : "Save Item"}
								</>
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

