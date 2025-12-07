"use client";

/**
 * React Error Boundary Component
 * Catches React component errors and reports them to Linear
 */

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
	error: Error | null;
	resetError: () => void;
}

class ErrorBoundaryClass extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
		};
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		// Report error to Linear in production
		if (process.env.NODE_ENV === "production") {
			// Use dynamic import to avoid SSR issues
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
								componentStack: errorInfo.componentStack,
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
		console.error("Error caught by boundary:", error, errorInfo);
	}

	resetError = (): void => {
		this.setState({
			hasError: false,
			error: null,
		});
	};

	render(): React.ReactNode {
		if (this.state.hasError) {
			const Fallback = this.props.fallback || DefaultErrorFallback;
			return <Fallback error={this.state.error} resetError={this.resetError} />;
		}

		return this.props.children;
	}
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
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
					{process.env.NODE_ENV === "development" && error && (
						<div className="rounded-md bg-muted p-4">
							<p className="text-sm font-mono text-destructive">
								{error.message}
							</p>
							{error.stack && (
								<pre className="mt-2 overflow-auto text-xs">{error.stack}</pre>
							)}
						</div>
					)}
				</CardContent>
				<CardFooter className="flex gap-2">
					<Button onClick={resetError} variant="default">
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

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
	return <ErrorBoundaryClass {...props} />;
};
