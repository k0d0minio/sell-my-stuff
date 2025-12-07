import { AdminItemsList } from "@/components/admin/admin-items-list";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function AdminItemsPage() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Items</CardTitle>
					<CardDescription>Manage your store items</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminItemsList />
				</CardContent>
			</Card>
		</div>
	);
}

