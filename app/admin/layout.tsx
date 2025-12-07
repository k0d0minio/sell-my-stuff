import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { hasValidSession } from "@/lib/auth/session";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Check authentication
	const isAuthenticated = await hasValidSession();
	if (!isAuthenticated) {
		redirect("/admin-login");
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<AdminNav />
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{children}
			</main>
		</div>
	);
}

