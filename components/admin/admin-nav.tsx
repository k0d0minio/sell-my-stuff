"use client";

import { LogOut, Package, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";

export function AdminNav() {
	return (
		<nav className="border-b bg-white shadow-sm">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center space-x-4">
						<Link
							href="/admin/items"
							className="flex items-center space-x-2 text-lg font-semibold text-gray-900"
						>
							<Package className="h-5 w-5" />
							<span>Store Admin</span>
						</Link>
					</div>
					<div className="flex items-center space-x-4">
						<Link href="/admin/items/new">
							<Button variant="outline" size="sm">
								<Plus className="mr-2 h-4 w-4" />
								New Item
							</Button>
						</Link>
						<form action={logoutAction}>
							<Button type="submit" variant="ghost" size="sm">
								<LogOut className="mr-2 h-4 w-4" />
								Logout
							</Button>
						</form>
					</div>
				</div>
			</div>
		</nav>
	);
}

