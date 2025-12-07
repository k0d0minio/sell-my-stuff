import { redirect } from "next/navigation";
import { ItemForm } from "@/components/admin/item-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getItemById } from "@/lib/actions/items";

export default async function EditItemPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const itemId = Number.parseInt(id, 10);

	if (Number.isNaN(itemId)) {
		redirect("/admin/items");
	}

	const item = await getItemById(itemId);

	if (!item) {
		redirect("/admin/items");
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Edit Item</CardTitle>
					<CardDescription>Update your item listing</CardDescription>
				</CardHeader>
				<CardContent>
					<ItemForm item={item} />
				</CardContent>
			</Card>
		</div>
	);
}

