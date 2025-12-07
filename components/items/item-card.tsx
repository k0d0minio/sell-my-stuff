"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import type { Item } from "@/lib/db/types";
import { ITEM_PLACEHOLDER_IMAGE } from "@/lib/images";

interface ItemCardProps {
	item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
	const categoryLabels: Record<string, string> = {
		clothes: "Clothes",
		decorations: "Decorations",
		furniture: "Furniture",
	};
	const imageSrc = item.images[0] ?? ITEM_PLACEHOLDER_IMAGE;
	const imageAlt =
		item.images.length > 0 ? item.title : `${item.title} placeholder image`;

	return (
		<Link href={`/items/${item.id}`}>
			<Card className="hover:shadow-lg transition-shadow cursor-pointer">
				<CardContent className="p-0">
					<div className="flex gap-4">
						<div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
							<Image
								src={imageSrc}
								alt={imageAlt}
								fill
								className="object-cover rounded-l-lg"
							/>
						</div>
						<div className="flex-1 p-4 flex flex-col justify-between">
							<div>
								<h3 className="text-lg font-semibold text-gray-900 mb-1">
									{item.title}
								</h3>
								<p className="text-sm text-gray-500 mb-2">
									{categoryLabels[item.category] || item.category}
								</p>
								<p className="text-sm text-gray-600 line-clamp-2">
									{item.description}
								</p>
							</div>
							<div className="mt-4">
								<p className="text-xl font-bold text-gray-900">
									{formatCurrency(item.price)}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}

