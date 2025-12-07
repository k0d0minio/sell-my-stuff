"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { ItemCard } from "@/components/items/item-card";
import { SearchFilter } from "@/components/items/search-filter";
import { getPublicItems } from "@/lib/actions/items-public";
import type { Item } from "@/lib/db/types";

export function ItemsList() {
	const searchParams = useSearchParams();
	const [items, setItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);

	const search = useMemo(
		() => searchParams.get("search") || undefined,
		[searchParams],
	);
	const category = useMemo(
		() =>
			(searchParams.get("category") as
				| "clothes"
				| "decorations"
				| "furniture"
				| null) || undefined,
		[searchParams],
	);

	useEffect(() => {
		loadItems();
	}, [search, category]);

	async function loadItems() {
		setLoading(true);
		const filteredItems = await getPublicItems({ search, category });
		setItems(filteredItems);
		setLoading(false);
	}

	if (loading) {
		return (
			<div className="text-center py-12">
				<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
				<p className="mt-4 text-gray-600">Loading items...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<SearchFilter />
			{items.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-500 text-lg">No items found</p>
					<p className="text-gray-400 text-sm mt-2">
						Try adjusting your search or filter criteria
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{items.map((item) => (
						<ItemCard key={item.id} item={item} />
					))}
				</div>
			)}
		</div>
	);
}

