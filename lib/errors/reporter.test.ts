import { afterEach, describe, expect, it, vi } from "vitest";
import {
	collectErrorContext,
	formatErrorForLinear,
	generateErrorSignature,
} from "./reporter";

describe("Error Reporter", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});
	describe("generateErrorSignature", () => {
		it("should generate a signature from message, URL, and stack", () => {
			const message = "Test error";
			const stack = "Error: Test error\n    at test.js:1:1";
			const url = "https://example.com/test";

			const signature = generateErrorSignature(message, stack, url);

			expect(signature).toBeTruthy();
			expect(typeof signature).toBe("string");
			expect(signature.length).toBe(64); // SHA256 hex string length
		});

		it("should normalize URLs with dynamic segments", () => {
			const message = "Test error";
			const stack = "Error: Test error\n    at test.js:1:1";
			const url1 = "https://example.com/users/123";
			const url2 = "https://example.com/users/456";

			const sig1 = generateErrorSignature(message, stack, url1);
			const sig2 = generateErrorSignature(message, stack, url2);

			expect(sig1).toBe(sig2); // Should be the same after normalization
		});

		it("should normalize UUIDs in URLs", () => {
			const message = "Test error";
			// Use the same stack trace for both to ensure only URL normalization matters
			const stack = "Error: Test error\n    at test.js:1:1";
			// Use UUIDs that don't start with digits to avoid conflict with /d+ replacement
			const url1 =
				"https://example.com/users/abcdef12-3456-7890-abcd-ef1234567890";
			const url2 =
				"https://example.com/users/fedcba21-6543-0987-dcba-fe9876543210";

			const sig1 = generateErrorSignature(message, stack, url1);
			const sig2 = generateErrorSignature(message, stack, url2);

			// Both URLs should normalize to the same pattern, so signatures should match
			// The regex /[a-f0-9-]{36}/gi matches UUIDs and normalizes them to /:uuid
			expect(sig1).toBe(sig2);
		});

		it("should handle missing stack and URL", () => {
			const message = "Test error";

			const signature = generateErrorSignature(message);

			expect(signature).toBeTruthy();
			expect(typeof signature).toBe("string");
		});
	});

	describe("collectErrorContext", () => {
		it("should collect context from Error object", () => {
			const error = new Error("Test error message");
			error.stack = "Error: Test error message\n    at test.js:1:1";

			const context = collectErrorContext(error);

			expect(context.message).toBe("Test error message");
			expect(context.stack).toBe(error.stack);
			expect(context.timestamp).toBeTruthy();
			expect(context.environment).toBeTruthy();
		});

		it("should collect context with additional information", () => {
			const error = new Error("Test error");
			const additionalContext = {
				url: "https://example.com/test",
				userAgent: "Mozilla/5.0",
				requestMethod: "POST",
				userId: "user-123",
				sessionId: "session-456",
				additionalData: { key: "value" },
			};

			const context = collectErrorContext(error, additionalContext);

			expect(context.url).toBe(additionalContext.url);
			expect(context.userAgent).toBe(additionalContext.userAgent);
			expect(context.requestMethod).toBe(additionalContext.requestMethod);
			expect(context.userId).toBe(additionalContext.userId);
			expect(context.sessionId).toBe(additionalContext.sessionId);
			expect(context.additionalData).toEqual(additionalContext.additionalData);
		});

		it("should handle non-Error objects", () => {
			const error = "String error";

			const context = collectErrorContext(error);

			expect(context.message).toBe("String error");
			expect(context.stack).toBeUndefined();
		});

		it("should handle null/undefined errors", () => {
			const context1 = collectErrorContext(null);
			const context2 = collectErrorContext(undefined);

			// String(null) returns "null", String(undefined) returns "undefined"
			expect(context1.message).toBe("null");
			expect(context2.message).toBe("undefined");
		});

		it("should handle empty string errors", () => {
			const context = collectErrorContext("");

			// Empty string is falsy, so should fall back to "Unknown error"
			expect(context.message).toBe("Unknown error");
		});

		it("should set environment from process.env.NODE_ENV", () => {
			const error = new Error("Test error");
			const context = collectErrorContext(error);

			expect(context.environment).toBe(process.env.NODE_ENV || "development");
		});

		it("should default to development when NODE_ENV is not set", () => {
			// Use vi.stubEnv to temporarily unset NODE_ENV
			vi.stubEnv("NODE_ENV", undefined);

			const error = new Error("Test error");
			const context = collectErrorContext(error);

			expect(context.environment).toBe("development");

			// Restore
			vi.unstubAllEnvs();
		});
	});

	describe("formatErrorForLinear", () => {
		it("should format error context for Linear", () => {
			const context = {
				message: "Test error message",
				stack: "Error: Test error message\n    at test.js:1:1",
				timestamp: "2024-01-01T00:00:00.000Z",
				environment: "test",
				url: "https://example.com/test",
				userAgent: "Mozilla/5.0",
				requestMethod: "POST",
			};

			const formatted = formatErrorForLinear(context);

			expect(formatted).toContain("## Error Details");
			expect(formatted).toContain("Test error message");
			expect(formatted).toContain("2024-01-01T00:00:00.000Z");
			expect(formatted).toContain("test");
			expect(formatted).toContain("https://example.com/test");
			expect(formatted).toContain("POST");
			expect(formatted).toContain("Mozilla/5.0");
			expect(formatted).toContain("## Stack Trace");
			expect(formatted).toContain("Error: Test error message");
		});

		it("should format error with user and session IDs", () => {
			const context = {
				message: "Test error",
				timestamp: "2024-01-01T00:00:00.000Z",
				environment: "test",
				userId: "user-123",
				sessionId: "session-456",
			};

			const formatted = formatErrorForLinear(context);

			expect(formatted).toContain("user-123");
			expect(formatted).toContain("session-456");
		});

		it("should format error with additional data", () => {
			const context = {
				message: "Test error",
				timestamp: "2024-01-01T00:00:00.000Z",
				environment: "test",
				additionalData: {
					key1: "value1",
					key2: 123,
				},
			};

			const formatted = formatErrorForLinear(context);

			expect(formatted).toContain("## Additional Context");
			expect(formatted).toContain("key1");
			expect(formatted).toContain("value1");
			expect(formatted).toContain("key2");
			expect(formatted).toContain("123");
		});

		it("should format minimal error context", () => {
			const context = {
				message: "Test error",
				timestamp: "2024-01-01T00:00:00.000Z",
				environment: "test",
			};

			const formatted = formatErrorForLinear(context);

			expect(formatted).toContain("## Error Details");
			expect(formatted).toContain("Test error");
			expect(formatted).not.toContain("## Stack Trace");
			expect(formatted).not.toContain("## Additional Context");
		});
	});
});
