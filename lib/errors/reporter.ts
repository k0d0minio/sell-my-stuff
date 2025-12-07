/**
 * Error Reporter
 * Collects error context and prepares it for reporting
 */

import { createHash } from "node:crypto";
import type { ErrorContext } from "./types";

/**
 * Generates a unique signature for an error to enable deduplication.
 *
 * Creates a SHA-256 hash from the error message, normalized URL, and first stack trace line.
 * This signature is used to group similar errors together in error reporting systems.
 *
 * @param message - The error message
 * @param stack - Optional stack trace
 * @param url - Optional URL where the error occurred (will be normalized)
 * @returns A hexadecimal hash string representing the error signature
 *
 * @example
 * ```ts
 * const signature = generateErrorSignature(
 *   "Failed to fetch data",
 *   "Error: Failed to fetch data\n  at fetchData (utils.ts:10)",
 *   "https://example.com/api/users/123"
 * );
 * ```
 */
export function generateErrorSignature(
	message: string,
	stack?: string,
	url?: string,
): string {
	// Normalize URL by removing query params and dynamic segments
	const normalizedUrl = url
		? url
				.split("?")[0]
				.replace(/\/\d+/g, "/:id")
				.replace(/\/[a-f0-9-]{36}/gi, "/:uuid")
		: "";

	// Extract first meaningful line from stack trace
	const stackLine =
		stack
			?.split("\n")[1]
			?.trim()
			?.replace(/\(.*\)/g, "")
			?.replace(/at\s+/g, "")
			?.split(":")[0] || "";

	// Create signature from message, normalized URL, and first stack line
	const signatureString = `${message}|${normalizedUrl}|${stackLine}`;

	// Hash the signature
	return createHash("sha256").update(signatureString).digest("hex");
}

/**
 * Collects error context from various sources for error reporting.
 *
 * Extracts relevant information from an error object and additional context
 * to create a comprehensive error report. This context is used for debugging
 * and error tracking in production.
 *
 * @param error - The error object or unknown value to extract context from
 * @param additionalContext - Optional additional context (URL, user agent, etc.)
 * @returns An ErrorContext object with all collected information
 *
 * @example
 * ```ts
 * const context = collectErrorContext(
 *   new Error("API request failed"),
 *   {
 *     url: "https://example.com/api",
 *     userAgent: "Mozilla/5.0...",
 *     requestMethod: "POST",
 *     userId: "user-123"
 *   }
 * );
 * ```
 */
export function collectErrorContext(
	error: Error | unknown,
	additionalContext?: {
		url?: string;
		userAgent?: string;
		requestMethod?: string;
		userId?: string;
		sessionId?: string;
		additionalData?: Record<string, unknown>;
	},
): ErrorContext {
	const errorMessage =
		error instanceof Error ? error.message : String(error) || "Unknown error";
	const stack = error instanceof Error ? error.stack : undefined;

	return {
		message: errorMessage,
		stack,
		timestamp: new Date().toISOString(),
		url: additionalContext?.url,
		userAgent: additionalContext?.userAgent,
		requestMethod: additionalContext?.requestMethod,
		environment: process.env.NODE_ENV || "development",
		userId: additionalContext?.userId,
		sessionId: additionalContext?.sessionId,
		additionalData: additionalContext?.additionalData,
	};
}

/**
 * Formats error context as markdown for display in Linear issues.
 *
 * Converts an ErrorContext object into a well-formatted markdown string
 * suitable for display in Linear issue descriptions. Includes all relevant
 * error information in a structured format.
 *
 * @param context - The error context to format
 * @returns A markdown-formatted string ready for Linear issue description
 *
 * @example
 * ```ts
 * const context = collectErrorContext(error, { url: "https://example.com" });
 * const markdown = formatErrorForLinear(context);
 * // Returns formatted markdown with error details, stack trace, etc.
 * ```
 */
export function formatErrorForLinear(context: ErrorContext): string {
	const sections: string[] = [];

	sections.push("## Error Details");
	sections.push(`**Message:** ${context.message}`);
	sections.push(`**Timestamp:** ${context.timestamp}`);
	sections.push(`**Environment:** ${context.environment}`);

	if (context.url) {
		sections.push(`**URL:** ${context.url}`);
	}

	if (context.requestMethod) {
		sections.push(`**Method:** ${context.requestMethod}`);
	}

	if (context.userAgent) {
		sections.push(`**User Agent:** ${context.userAgent}`);
	}

	if (context.stack) {
		sections.push("\n## Stack Trace");
		sections.push("```");
		sections.push(context.stack);
		sections.push("```");
	}

	if (context.userId) {
		sections.push(`\n**User ID:** ${context.userId}`);
	}

	if (context.sessionId) {
		sections.push(`**Session ID:** ${context.sessionId}`);
	}

	if (
		context.additionalData &&
		Object.keys(context.additionalData).length > 0
	) {
		sections.push("\n## Additional Context");
		sections.push("```json");
		sections.push(JSON.stringify(context.additionalData, null, 2));
		sections.push("```");
	}

	return sections.join("\n");
}
