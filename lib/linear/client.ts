/**
 * Linear GraphQL API Client
 * Handles communication with Linear's GraphQL API
 */

const LINEAR_API_URL = "https://api.linear.app/graphql";

export interface LinearGraphQLResponse<T> {
	data?: T;
	errors?: Array<{
		message: string;
		extensions?: Record<string, unknown>;
	}>;
}

export interface LinearIssue {
	id: string;
	identifier: string;
	title: string;
	url: string;
}

export interface CreateIssueResponse {
	issueCreate: {
		issue: LinearIssue;
		success: boolean;
	};
}

export interface UpdateIssueResponse {
	issueUpdate: {
		issue: LinearIssue;
		success: boolean;
	};
}

export interface CreateCommentResponse {
	commentCreate: {
		comment: {
			id: string;
		};
		success: boolean;
	};
}

export interface GetTeamResponse {
	team: {
		id: string;
		name: string;
	};
}

export interface GetIssueResponse {
	issue: LinearIssue | null;
}

/**
 * Linear API Client
 */
export class LinearClient {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	/**
	 * Execute a GraphQL query/mutation
	 */
	private async execute<T>(
		query: string,
		variables?: Record<string, unknown>,
	): Promise<T> {
		const response = await fetch(LINEAR_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: this.apiKey,
			},
			body: JSON.stringify({ query, variables }),
		});

		if (!response.ok) {
			throw new Error(
				`Linear API request failed: ${response.status} ${response.statusText}`,
			);
		}

		const result: LinearGraphQLResponse<T> = await response.json();

		if (result.errors && result.errors.length > 0) {
			throw new Error(
				`Linear API errors: ${result.errors.map((e) => e.message).join(", ")}`,
			);
		}

		if (!result.data) {
			throw new Error("Linear API returned no data");
		}

		return result.data;
	}

	/**
	 * Get team by name, key, or ID
	 */
	async getTeam(teamIdentifier: string): Promise<{ id: string; name: string }> {
		// Try by ID first (UUID format)
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (uuidRegex.test(teamIdentifier)) {
			const query = `
				query GetTeam($id: String!) {
					team(id: $id) {
						id
						name
					}
				}
			`;
			const data = await this.execute<GetTeamResponse>(query, {
				id: teamIdentifier,
			});
			if (data.team) {
				return data.team;
			}
		}

		// Try by key (team key like "ENG", "DESIGN", etc.)
		const queryByKey = `
			query GetTeamByKey($key: String!) {
				team(key: $key) {
					id
					name
				}
			}
		`;
		try {
			const data = await this.execute<GetTeamResponse>(queryByKey, {
				key: teamIdentifier.toUpperCase(),
			});
			if (data.team) {
				return data.team;
			}
		} catch {
			// Continue to name lookup
		}

		// Try by name (list teams and find match)
		const queryTeams = `
			query ListTeams {
				teams {
					nodes {
						id
						name
						key
					}
				}
			}
		`;
		try {
			const data = await this.execute<{
				teams: { nodes: Array<{ id: string; name: string; key: string }> };
			}>(queryTeams);
			const team = data.teams.nodes.find(
				(t) =>
					t.name.toLowerCase() === teamIdentifier.toLowerCase() ||
					t.key.toLowerCase() === teamIdentifier.toLowerCase(),
			);
			if (team) {
				return { id: team.id, name: team.name };
			}
		} catch {
			// Fall through to error
		}

		throw new Error(`Team not found: ${teamIdentifier}`);
	}

	/**
	 * Create a new Linear issue
	 */
	async createIssue(
		title: string,
		description: string,
		teamId: string,
		labelIds?: string[],
	): Promise<LinearIssue> {
		const mutation = `
			mutation CreateIssue($input: IssueCreateInput!) {
				issueCreate(input: $input) {
					issue {
						id
						identifier
						title
						url
					}
					success
				}
			}
		`;

		const variables = {
			input: {
				title,
				description,
				teamId,
				...(labelIds && labelIds.length > 0 ? { labelIds } : {}),
			},
		};

		const data = await this.execute<CreateIssueResponse>(mutation, variables);

		if (!data.issueCreate.success || !data.issueCreate.issue) {
			throw new Error("Failed to create Linear issue");
		}

		return data.issueCreate.issue;
	}

	/**
	 * Update an existing Linear issue
	 */
	async updateIssue(
		issueId: string,
		title?: string,
		description?: string,
	): Promise<LinearIssue> {
		const mutation = `
			mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
				issueUpdate(id: $id, input: $input) {
					issue {
						id
						identifier
						title
						url
					}
					success
				}
			}
		`;

		const variables: {
			id: string;
			input: Record<string, unknown>;
		} = {
			id: issueId,
			input: {},
		};

		if (title) variables.input.title = title;
		if (description) variables.input.description = description;

		const data = await this.execute<UpdateIssueResponse>(mutation, variables);

		if (!data.issueUpdate.success || !data.issueUpdate.issue) {
			throw new Error("Failed to update Linear issue");
		}

		return data.issueUpdate.issue;
	}

	/**
	 * Add a comment to a Linear issue
	 */
	async addComment(issueId: string, body: string): Promise<string> {
		const mutation = `
			mutation CreateComment($input: CommentCreateInput!) {
				commentCreate(input: $input) {
					comment {
						id
					}
					success
				}
			}
		`;

		const variables = {
			input: {
				issueId,
				body,
			},
		};

		const data = await this.execute<CreateCommentResponse>(mutation, variables);

		if (!data.commentCreate.success || !data.commentCreate.comment) {
			throw new Error("Failed to create comment on Linear issue");
		}

		return data.commentCreate.comment.id;
	}

	/**
	 * Find an issue by title (fuzzy search)
	 * Note: Linear doesn't have a direct search API, so we'll use issue list
	 * This is a simplified version - in production you might want to cache results
	 */
	async findIssueByTitle(
		teamId: string,
		titlePattern: string,
	): Promise<LinearIssue | null> {
		const query = `
			query FindIssues($filter: IssueFilter, $first: Int!) {
				issues(filter: $filter, first: $first) {
					nodes {
						id
						identifier
						title
						url
					}
				}
			}
		`;

		const variables = {
			filter: {
				team: { id: { eq: teamId } },
				title: { containsIgnoreCase: titlePattern },
			},
			first: 10,
		};

		try {
			const data = await this.execute<{
				issues: { nodes: LinearIssue[] };
			}>(query, variables);

			// Find exact or close match
			const match = data.issues.nodes.find(
				(issue) =>
					issue.title.toLowerCase() === titlePattern.toLowerCase() ||
					issue.title.includes(titlePattern),
			);

			return match || null;
		} catch {
			return null;
		}
	}
}
