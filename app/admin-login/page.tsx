import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { hasValidSession } from "@/lib/auth/session";

export default async function AdminLoginPage() {
	// Redirect if already logged in
	const isAuthenticated = await hasValidSession();
	if (isAuthenticated) {
		redirect("/admin/items");
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
						Admin Login
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Enter your password to access the admin area
					</p>
				</div>
				<LoginForm />
			</div>
		</div>
	);
}

