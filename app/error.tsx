"use client";

/**
 * Next.js Route-level Error Boundary
 * Catches errors in the page component tree
 */

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
	useEffect(() => {
		// Report error to Linear in production
		if (process.env.NODE_ENV === "production") {
			import("@/lib/errors/reporter")
				.then(({ collectErrorContext }) => {
					import("@/lib/linear/errors").then(({ getLinearErrorReporter }) => {
						const context = collectErrorContext(error, {
							url:
								typeof window !== "undefined"
									? window.location.href
									: undefined,
							userAgent:
								typeof window !== "undefined"
									? window.navigator.userAgent
									: undefined,
							additionalData: {
								digest: error.digest,
							},
						});

						const reporter = getLinearErrorReporter();
						reporter.reportError(context).catch((reportError) => {
							console.error("Failed to report error to Linear:", reportError);
						});
					});
				})
				.catch((importError) => {
					console.error(
						"Failed to import error reporting modules:",
						importError,
					);
				});
		}

		// Log error for debugging
		console.error("Route error:", error);
	}, [error]);

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-destructive" />
						<CardTitle>Something went wrong</CardTitle>
					</div>
					<CardDescription>
						We encountered an unexpected error. Our team has been automatically
						notified and is working on a fix.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{process.env.NODE_ENV === "development" && (
						<div className="rounded-md bg-muted p-4">
							<p className="text-sm font-mono text-destructive">
								{error.message}
							</p>
							{error.digest && (
								<p className="mt-2 text-xs text-muted-foreground">
									Error ID: {error.digest}
								</p>
							)}
							{error.stack && (
								<pre className="mt-2 overflow-auto text-xs">{error.stack}</pre>
							)}
						</div>
					)}
				</CardContent>
				<CardFooter className="flex gap-2">
					<Button onClick={reset} variant="default">
						<RefreshCw className="mr-2 h-4 w-4" />
						Try again
					</Button>
					<Button
						onClick={() => {
							window.location.href = "/";
						}}
						variant="outline"
					>
						<Home className="mr-2 h-4 w-4" />
						Go home
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
