"use client";

import { AlertCircle } from "lucide-react";
import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/lib/actions/auth";

export function LoginForm() {
	const [state, formAction] = useActionState(loginAction, undefined);

	return (
		<form action={formAction} className="mt-8 space-y-6">
			<div className="space-y-4 rounded-md shadow-sm">
				<div>
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						name="password"
						type="password"
						autoComplete="current-password"
						required
						className="mt-1"
						placeholder="Enter password"
					/>
				</div>
			</div>

			{state?.error && (
				<Alert variant="destructive" role="alert">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{state.error}</AlertDescription>
				</Alert>
			)}

			<div>
				<Button type="submit" className="w-full">
					Sign In
				</Button>
			</div>
		</form>
	);
}

