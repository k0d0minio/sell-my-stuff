import { AdminItemsList } from "@/components/admin/admin-items-list";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getTotalEstimatedIncome } from "@/lib/actions/items";
import { formatCurrency } from "@/lib/currency";

export default async function AdminItemsPage() {
	const totalEstimatedIncome = await getTotalEstimatedIncome();

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Estimated Income</CardTitle>
					<CardDescription>
						Projected revenue if all items sell at full price
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-3xl font-semibold">
						{formatCurrency(totalEstimatedIncome)}
					</p>
				</CardContent>
			</Card>
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

