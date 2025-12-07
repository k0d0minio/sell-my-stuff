/**
 * API Route Error Handler
 * Wrapper for API routes to handle errors and report to Linear
 */

import { type NextRequest, NextResponse } from "next/server";
import { getLinearErrorReporter } from "../linear/errors";
import { collectErrorContext } from "./reporter";

type ApiHandler = (
	request: NextRequest,
	...args: unknown[]
) => Promise<NextResponse> | NextResponse;

/**
 * Wrap an API route handler with error handling and Linear reporting
 */
export function withErrorHandler(handler: ApiHandler): ApiHandler {
	return async (request: NextRequest, ...args: unknown[]) => {
		try {
			return await handler(request, ...args);
		} catch (error) {
			// Collect error context
			const context = collectErrorContext(error, {
				url: request.url,
				userAgent: request.headers.get("user-agent") || undefined,
				requestMethod: request.method,
				additionalData: {
					headers: Object.fromEntries(request.headers.entries()),
				},
			});

			// Report to Linear (non-blocking)
			if (process.env.NODE_ENV === "production") {
				const reporter = getLinearErrorReporter();
				reporter.reportError(context).catch((reportError) => {
					console.error("Failed to report error to Linear:", reportError);
				});
			}

			// Log error
			console.error("API route error:", error);

			// Return user-friendly error response
			return NextResponse.json(
				{
					error: "An unexpected error occurred. Our team has been notified.",
				},
				{ status: 500 },
			);
		}
	};
}

/**
 * Create an error response with optional custom message
 */
export function createErrorResponse(
	message: string,
	status: number = 500,
	error?: unknown,
): NextResponse {
	// Report to Linear if it's a server error (5xx)
	if (status >= 500 && process.env.NODE_ENV === "production" && error) {
		const reporter = getLinearErrorReporter();
		const context = collectErrorContext(error);
		reporter.reportError(context).catch((reportError) => {
			console.error("Failed to report error to Linear:", reportError);
		});
	}

	return NextResponse.json({ error: message }, { status });
}
