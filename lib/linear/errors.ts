/**
 * Linear Error Reporting Service
 * Handles error reporting to Linear with deduplication
 */

import {
	formatErrorForLinear,
	generateErrorSignature,
} from "../errors/reporter";
import type { ErrorContext } from "../errors/types";
import { LinearClient } from "./client";

interface ErrorCacheEntry {
	issueId: string;
	issueIdentifier: string;
	lastOccurrence: Date;
	occurrenceCount: number;
}

/**
 * In-memory cache for error deduplication
 * Key: error signature, Value: Linear issue info
 */
const errorCache = new Map<string, ErrorCacheEntry>();

// Cache TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Clean up stale cache entries
 */
function cleanupCache(): void {
	const now = Date.now();
	for (const [signature, entry] of errorCache.entries()) {
		if (now - entry.lastOccurrence.getTime() > CACHE_TTL_MS) {
			errorCache.delete(signature);
		}
	}
}

// Clean up cache every hour
if (typeof setInterval !== "undefined") {
	setInterval(cleanupCache, 60 * 60 * 1000);
}

/**
 * Linear Error Reporter
 */
export class LinearErrorReporter {
	private client: LinearClient | null = null;
	private teamId: string | null = null;
	private labelIds: string[] = [];
	private enabled: boolean;

	constructor() {
		const apiKey = process.env.LINEAR_API_KEY;
		const teamId = process.env.LINEAR_TEAM_ID;
		const errorLabel = process.env.LINEAR_ERROR_LABEL;

		this.enabled =
			process.env.NODE_ENV === "production" && !!apiKey && !!teamId;

		if (this.enabled && apiKey) {
			this.client = new LinearClient(apiKey);
			this.teamId = teamId || null;

			// If label is provided, we'll need to look it up
			// For now, we'll store the label name and look it up when needed
			if (errorLabel) {
				// Label IDs will be resolved when creating issues
				// This is a simplified implementation
			}
		}
	}

	/**
	 * Report an error to Linear
	 * Returns the Linear issue ID if successful, null otherwise
	 */
	async reportError(context: ErrorContext): Promise<string | null> {
		if (!this.enabled || !this.client || !this.teamId) {
			return null;
		}

		try {
			// Generate error signature for deduplication
			const signature = generateErrorSignature(
				context.message,
				context.stack,
				context.url,
			);

			// Check cache for existing issue
			const cached = errorCache.get(signature);

			if (cached) {
				// Update existing issue with new occurrence
				const occurrenceCount = cached.occurrenceCount + 1;
				const commentBody = `**Error Occurrence #${occurrenceCount}**\n\n${formatErrorForLinear(context)}`;

				try {
					await this.client.addComment(cached.issueId, commentBody);

					// Update cache
					errorCache.set(signature, {
						...cached,
						lastOccurrence: new Date(),
						occurrenceCount,
					});

					return cached.issueId;
				} catch (error) {
					// If comment fails, try to create new issue
					console.error("Failed to add comment to Linear issue:", error);
				}
			}

			// Create new issue
			const title = `[Error] ${context.message.substring(0, 100)}`;
			const description = formatErrorForLinear(context);

			const issue = await this.client.createIssue(
				title,
				description,
				this.teamId,
				this.labelIds.length > 0 ? this.labelIds : undefined,
			);

			// Cache the issue
			errorCache.set(signature, {
				issueId: issue.id,
				issueIdentifier: issue.identifier,
				lastOccurrence: new Date(),
				occurrenceCount: 1,
			});

			return issue.id;
		} catch (error) {
			// Don't throw - error reporting should never break the app
			console.error("Failed to report error to Linear:", error);
			return null;
		}
	}

	/**
	 * Initialize the reporter (e.g., resolve team ID from name)
	 */
	async initialize(): Promise<void> {
		if (!this.enabled || !this.client) {
			return;
		}

		const teamIdentifier = process.env.LINEAR_TEAM_ID;
		if (!teamIdentifier) {
			return;
		}

		try {
			// If teamIdentifier looks like a UUID, use it directly
			// Otherwise, try to resolve it
			const uuidRegex =
				/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
			if (!uuidRegex.test(teamIdentifier)) {
				const team = await this.client.getTeam(teamIdentifier);
				this.teamId = team.id;
			} else {
				this.teamId = teamIdentifier;
			}
		} catch (error) {
			console.error("Failed to initialize Linear error reporter:", error);
			this.enabled = false;
		}
	}
}

// Singleton instance
let reporterInstance: LinearErrorReporter | null = null;

/**
 * Get the Linear error reporter instance
 */
export function getLinearErrorReporter(): LinearErrorReporter {
	if (!reporterInstance) {
		reporterInstance = new LinearErrorReporter();
	}
	return reporterInstance;
}
