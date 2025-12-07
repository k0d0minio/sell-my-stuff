import { ItemForm } from "@/components/admin/item-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function NewItemPage() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Add New Item</CardTitle>
					<CardDescription>Create a new listing for your store</CardDescription>
				</CardHeader>
				<CardContent>
					<ItemForm />
				</CardContent>
			</Card>
		</div>
	);
}

