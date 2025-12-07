"use client";

import { Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { deleteItem, getAllItems } from "@/lib/actions/items";
import type { Item } from "@/lib/db/types";
import Image from "next/image";

export function AdminItemsList() {
	const router = useRouter();
	const [items, setItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);
	const [deletingId, setDeletingId] = useState<number | null>(null);

	useEffect(() => {
		loadItems();
	}, []);

	async function loadItems() {
		setLoading(true);
		const allItems = await getAllItems();
		setItems(allItems);
		setLoading(false);
	}

	async function handleDelete(id: number) {
		if (!confirm("Are you sure you want to delete this item?")) {
			return;
		}

		setDeletingId(id);
		const result = await deleteItem(id);
		setDeletingId(null);

		if (result.success) {
			await loadItems();
		} else {
			alert(result.error);
		}
	}

	if (loading) {
		return <div className="text-center py-8">Loading items...</div>;
	}

	if (items.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 mb-4">No items yet</p>
				<Link href="/admin/items/new">
					<Button>Add Your First Item</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{items.map((item) => (
				<Card key={item.id}>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<CardTitle className="text-lg">{item.title}</CardTitle>
								<CardDescription>
									Category: {item.category.charAt(0).toUpperCase() + item.category.slice(1)} • Price: ${item.price.toFixed(2)}
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex gap-4">
							{item.images.length > 0 && (
								<div className="relative w-24 h-24 flex-shrink-0">
									<Image
										src={item.images[0]}
										alt={item.title}
										fill
										className="object-cover rounded"
									/>
								</div>
							)}
							<p className="text-sm text-gray-600 line-clamp-3 flex-1">
								{item.description}
							</p>
						</div>
					</CardContent>
					<CardFooter className="flex justify-end space-x-2">
						<Link href={`/items/${item.id}`}>
							<Button variant="outline" size="sm">
								<Eye className="mr-2 h-4 w-4" />
								View
							</Button>
						</Link>
						<Link href={`/admin/items/${item.id}/edit`}>
							<Button variant="outline" size="sm">
								<Edit className="mr-2 h-4 w-4" />
								Edit
							</Button>
						</Link>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleDelete(item.id)}
							disabled={deletingId === item.id}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							{deletingId === item.id ? "Deleting..." : "Delete"}
						</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}

