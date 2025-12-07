export interface ErrorContext {
	message: string;
	stack?: string;
	timestamp: string;
	url?: string;
	userAgent?: string;
	requestMethod?: string;
	environment: string;
	userId?: string;
	sessionId?: string;
	additionalData?: Record<string, unknown>;
}

export interface ErrorReport {
	context: ErrorContext;
	errorSignature: string;
	occurrenceCount?: number;
}

export interface LinearIssueData {
	title: string;
	description: string;
	teamId: string;
	labelIds?: string[];
}
