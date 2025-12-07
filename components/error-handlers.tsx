"use client";

/**
 * Global Error Handlers
 * Sets up window-level error handlers for unhandled errors
 */

import { useEffect } from "react";

export function ErrorHandlers() {
	useEffect(() => {
		// Only set up handlers in production
		if (process.env.NODE_ENV !== "production") {
			return;
		}

		// Handle unhandled promise rejections
		const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
			event.preventDefault();

			import("@/lib/errors/reporter")
				.then(({ collectErrorContext }) => {
					import("@/lib/linear/errors").then(({ getLinearErrorReporter }) => {
						const error =
							event.reason instanceof Error
								? event.reason
								: new Error(String(event.reason));

						const context = collectErrorContext(error, {
							url: window.location.href,
							userAgent: window.navigator.userAgent,
							additionalData: {
								type: "unhandledRejection",
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

			console.error("Unhandled promise rejection:", event.reason);
		};

		// Handle general errors
		const handleError = (
			event: ErrorEvent | Event,
			source?: string,
			lineno?: number,
			colno?: number,
			error?: Error,
		): void => {
			const actualError =
				error ||
				(event instanceof ErrorEvent ? event.error : new Error(String(event)));

			import("@/lib/errors/reporter")
				.then(({ collectErrorContext }) => {
					import("@/lib/linear/errors").then(({ getLinearErrorReporter }) => {
						const context = collectErrorContext(actualError, {
							url: window.location.href,
							userAgent: window.navigator.userAgent,
							additionalData: {
								type: "windowError",
								source,
								lineno,
								colno,
								message:
									event instanceof ErrorEvent ? event.message : undefined,
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

			console.error("Window error:", actualError);
		};

		// Attach handlers
		window.addEventListener("unhandledrejection", handleUnhandledRejection);
		window.addEventListener("error", handleError);

		// Cleanup
		return () => {
			window.removeEventListener(
				"unhandledrejection",
				handleUnhandledRejection,
			);
			window.removeEventListener("error", handleError);
		};
	}, []);

	return null;
}
