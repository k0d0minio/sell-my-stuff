"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth/session";

/**
 * Server action to handle admin login.
 * @param prevState - Previous state (from useActionState)
 * @param formData - FormData containing the password
 * @returns Error message if login fails, otherwise redirects
 */
export async function loginAction(
	prevState: { error?: string } | undefined,
	formData: FormData,
): Promise<{ error?: string }> {
	const password = formData.get("password") as string;

	if (!password) {
		return { error: "Password is required" };
	}

	const success = await createSession(password);

	if (!success) {
		return { error: "Invalid password" };
	}

	redirect("/admin/items");
}

/**
 * Server action to handle admin logout.
 */
export async function logoutAction(): Promise<void> {
	await destroySession();
	redirect("/admin-login");
}

