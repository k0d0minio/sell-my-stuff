"use client";

import { X, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
	images: File[];
	previews: string[];
	onImagesChange: (files: File[], previews: string[]) => void;
	maxImages?: number;
}

export function ImageUploader({
	images,
	previews,
	onImagesChange,
	maxImages = 10,
}: ImageUploaderProps) {
	const [localPreviews, setLocalPreviews] = useState<string[]>(previews);
	const [localFiles, setLocalFiles] = useState<File[]>(images);
	const [isDragging, setIsDragging] = useState(false);

	// Sync with props
	useEffect(() => {
		setLocalPreviews(previews);
		setLocalFiles(images);
	}, [previews, images]);

	const handleFileSelect = useCallback(
		(files: FileList | null) => {
			if (!files) return;

			const fileArray = Array.from(files);
			const imageFiles = fileArray.filter((file) =>
				file.type.startsWith("image/"),
			);

			if (localPreviews.length + imageFiles.length > maxImages) {
				alert(`Maximum ${maxImages} images allowed`);
				return;
			}

			const newFiles: File[] = [];
			const newPreviews: string[] = [];
			let loadedCount = 0;

			imageFiles.forEach((file) => {
				newFiles.push(file);
				const reader = new FileReader();
				reader.onload = (e) => {
					const result = e.target?.result as string;
					newPreviews.push(result);
					loadedCount++;
					if (loadedCount === imageFiles.length) {
						const updatedFiles = [...localFiles, ...newFiles];
						const updatedPreviews = [...localPreviews, ...newPreviews];
						setLocalFiles(updatedFiles);
						setLocalPreviews(updatedPreviews);
						onImagesChange(updatedFiles, updatedPreviews);
					}
				};
				reader.readAsDataURL(file);
			});
		},
		[localFiles, localPreviews, maxImages, onImagesChange],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragging(false);
			handleFileSelect(e.dataTransfer.files);
		},
		[handleFileSelect],
	);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

	const removeImage = useCallback(
		(index: number) => {
			const preview = localPreviews[index];
			const isDataUrl = preview?.startsWith("data:");
			
			// Remove from previews
			const updatedPreviews = localPreviews.filter((_, i) => i !== index);
			
			// Only remove from files if it was a data URL (new file)
			// Existing URLs don't have corresponding File objects
			let updatedFiles = localFiles;
			if (isDataUrl) {
				// Find the corresponding file index
				// Count how many data URLs come before this index
				let fileIndex = 0;
				for (let i = 0; i < index; i++) {
					if (localPreviews[i]?.startsWith("data:")) {
						fileIndex++;
					}
				}
				updatedFiles = localFiles.filter((_, i) => i !== fileIndex);
			}
			
			setLocalFiles(updatedFiles);
			setLocalPreviews(updatedPreviews);
			onImagesChange(updatedFiles, updatedPreviews);
		},
		[localFiles, localPreviews, onImagesChange],
	);

	return (
		<div className="space-y-4">
			<div
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				className={cn(
					"border-2 border-dashed rounded-lg p-6 text-center transition-colors",
					isDragging
						? "border-primary bg-primary/5"
						: "border-gray-300 hover:border-gray-400",
				)}
			>
				<Upload className="mx-auto h-12 w-12 text-gray-400" />
				<div className="mt-4">
					<label
						htmlFor="image-upload"
						className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80"
					>
						Click to upload images
					</label>
					<input
						id="image-upload"
						type="file"
						multiple
						accept="image/*"
						className="hidden"
						onChange={(e) => handleFileSelect(e.target.files)}
					/>
					<p className="mt-1 text-xs text-gray-500">
						PNG, JPG, GIF up to 10MB each
					</p>
					<p className="mt-1 text-xs text-gray-500">
						{localPreviews.length} / {maxImages} images
					</p>
				</div>
			</div>

			{localPreviews.length > 0 && (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
					{localPreviews.map((preview, index) => (
						<div key={index} className="relative group">
							<img
								src={preview}
								alt={`Preview ${index + 1}`}
								className="w-full h-32 object-cover rounded-lg border"
							/>
							<button
								type="button"
								onClick={() => removeImage(index)}
								className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
								aria-label="Remove image"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

