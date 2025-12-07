"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ITEM_PLACEHOLDER_IMAGE } from "@/lib/images";

interface ImageGalleryProps {
	images: string[];
	title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const galleryImages = images.length > 0 ? images : [ITEM_PLACEHOLDER_IMAGE];
	const hasMultipleImages = galleryImages.length > 1;
	const isPlaceholderOnly = images.length === 0;

	const goToPrevious = () => {
		setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
	};

	const goToNext = () => {
		setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
	};

	return (
		<div className="space-y-4">
			<div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
				<Image
					src={galleryImages[currentIndex]}
					alt={
						isPlaceholderOnly
							? `${title} placeholder image`
							: `${title} - Image ${currentIndex + 1}`
					}
					fill
					className="object-contain"
					priority={currentIndex === 0}
				/>
				{hasMultipleImages && (
					<>
						<Button
							variant="outline"
							size="icon"
							className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
							onClick={goToPrevious}
							aria-label="Previous image"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
							onClick={goToNext}
							aria-label="Next image"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
						<div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
							{currentIndex + 1} / {galleryImages.length}
						</div>
					</>
				)}
			</div>
			{hasMultipleImages && (
				<div className="grid grid-cols-4 gap-2">
					{images.map((image, index) => (
						<button
							key={index}
							type="button"
							onClick={() => setCurrentIndex(index)}
							className={cn(
								"relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
								currentIndex === index
									? "border-primary ring-2 ring-primary"
									: "border-gray-200 hover:border-gray-300",
							)}
						>
							<Image
								src={image}
								alt={`Thumbnail ${index + 1}`}
								fill
								className="object-cover"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

