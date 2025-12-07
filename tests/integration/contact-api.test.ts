import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { submitContactForm } from "@/lib/actions/contact";
import type { ContactFormData } from "@/lib/validations/contact";

// Mock Resend - create mock function inside factory to avoid hoisting issues
vi.mock("resend", () => {
	const mockSend = vi.fn();
	return {
		Resend: class {
			emails = {
				send: mockSend,
			};
		},
		__mockSend: mockSend, // Export mock for use in tests
	};
});

// Mock next/headers
const mockHeadersGet = vi.fn(() => null);
const mockHeaders = vi.fn(() => Promise.resolve({ get: mockHeadersGet }));
vi.mock("next/headers", () => ({
	headers: () => mockHeaders(),
}));

// Mock error reporting to avoid Linear API calls in tests
const mockReportError = vi.fn().mockResolvedValue(null);
vi.mock("@/lib/linear/errors", () => ({
	getLinearErrorReporter: vi.fn(() => ({
		reportError: mockReportError,
	})),
}));

// Get the mock function after module is loaded
let mockResendSend: ReturnType<typeof vi.fn>;

describe("submitContactForm Server Action", () => {
	let originalEnv: NodeJS.ProcessEnv;

	beforeEach(async () => {
		originalEnv = { ...process.env };
		process.env.RESEND_API_KEY = "test-api-key";
		process.env.RESEND_FROM_EMAIL = "test@example.com";
		process.env.RESEND_EMAIL_TO = "recipient@example.com";
		// Reset NODE_ENV to test default
		vi.unstubAllEnvs();

		// Get the mock function from the mocked module
		const resendModule = await import("resend");
		// @ts-expect-error - __mockSend is added by our mock
		mockResendSend = resendModule.__mockSend;
		mockResendSend.mockClear();
		mockReportError.mockClear();
		mockHeadersGet.mockReturnValue(null);
		mockHeaders.mockResolvedValue({ get: mockHeadersGet });
	});

	afterEach(() => {
		process.env = originalEnv;
		vi.clearAllMocks();
	});

	it("should return success and send email with valid data", async () => {
		mockResendSend.mockResolvedValueOnce({
			data: { id: "email-123" },
			error: null,
		});

		const formData: ContactFormData = {
			name: "John Doe",
			email: "john@example.com",
			message: "This is a test message with enough characters",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.message).toBe("Email sent successfully");
			expect(result.id).toBe("email-123");
		}

		expect(mockResendSend).toHaveBeenCalledWith({
			from: "test@example.com",
			to: "recipient@example.com",
			replyTo: "john@example.com",
			subject: "Contact Form Submission from John Doe",
			html: expect.stringContaining("John Doe"),
			text: expect.stringContaining("John Doe"),
		});
	});

	it("should return error for invalid form data - name too short", async () => {
		const formData: ContactFormData = {
			name: "J",
			email: "john@example.com",
			message: "This is a test message with enough characters",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Invalid form data");
		}
		expect(mockResendSend).not.toHaveBeenCalled();
	});

	it("should return error for invalid form data - invalid email", async () => {
		const formData = {
			name: "John Doe",
			email: "invalid-email",
			message: "This is a test message with enough characters",
		} as ContactFormData;

		const result = await submitContactForm(formData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Invalid form data");
		}
		expect(mockResendSend).not.toHaveBeenCalled();
	});

	it("should return error for invalid form data - message too short", async () => {
		const formData: ContactFormData = {
			name: "John Doe",
			email: "john@example.com",
			message: "Short",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Invalid form data");
		}
		expect(mockResendSend).not.toHaveBeenCalled();
	});

	it("should return error for missing required fields", async () => {
		const formData = {
			name: "John Doe",
			// email missing
			message: "This is a test message with enough characters",
		} as ContactFormData;

		const result = await submitContactForm(formData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Invalid form data");
		}
		expect(mockResendSend).not.toHaveBeenCalled();
	});

	it("should return error when RESEND_API_KEY is not configured", async () => {
		delete process.env.RESEND_API_KEY;

		const formData: ContactFormData = {
			name: "John Doe",
			email: "john@example.com",
			message: "This is a test message with enough characters",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Email service is not configured");
		}
		expect(mockResendSend).not.toHaveBeenCalled();
	});

	it("should return error when Resend API returns an error", async () => {
		mockResendSend.mockResolvedValueOnce({
			data: null,
			error: { message: "Resend API error" },
		});

		const formData: ContactFormData = {
			name: "John Doe",
			email: "john@example.com",
			message: "This is a test message with enough characters",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Failed to send email");
		}
	});

	it("should use default email addresses when env vars are not set", async () => {
		delete process.env.RESEND_FROM_EMAIL;
		delete process.env.RESEND_EMAIL_TO;

		mockResendSend.mockResolvedValueOnce({
			data: { id: "email-123" },
			error: null,
		});

		const formData: ContactFormData = {
			name: "John Doe",
			email: "john@example.com",
			message: "This is a test message with enough characters",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(true);
		expect(mockResendSend).toHaveBeenCalledWith(
			expect.objectContaining({
				from: "onboarding@resend.dev",
				to: "delivered@resend.dev",
			}),
		);
	});

	it("should handle message with newlines in HTML", async () => {
		mockResendSend.mockResolvedValueOnce({
			data: { id: "email-123" },
			error: null,
		});

		const formData: ContactFormData = {
			name: "John Doe",
			email: "john@example.com",
			message: "Line 1\nLine 2\nLine 3",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(true);
		expect(mockResendSend).toHaveBeenCalledWith(
			expect.objectContaining({
				html: expect.stringContaining("<br>"),
			}),
		);
	});

	it("should report error to Linear when RESEND_API_KEY is not configured in production", async () => {
		vi.stubEnv("NODE_ENV", "production");
		delete process.env.RESEND_API_KEY;

		const formData: ContactFormData = {
			name: "John Doe",
			email: "john@example.com",
			message: "This is a test message with enough characters",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(false);
		expect(mockReportError).toHaveBeenCalled();
	});

	it("should report error to Linear when Resend API returns an error in production", async () => {
		vi.stubEnv("NODE_ENV", "production");
		mockResendSend.mockResolvedValueOnce({
			data: null,
			error: { message: "Resend API error" },
		});

		const formData: ContactFormData = {
			name: "John Doe",
			email: "john@example.com",
			message: "This is a test message with enough characters",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(false);
		expect(mockReportError).toHaveBeenCalled();
	});

	it("should report unexpected errors to Linear in production", async () => {
		vi.stubEnv("NODE_ENV", "production");
		// Make resend throw an unexpected error to trigger the catch block
		mockResendSend.mockRejectedValueOnce(new Error("Unexpected resend error"));

		const formData: ContactFormData = {
			name: "John Doe",
			email: "john@example.com",
			message: "This is a test message with enough characters",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe(
				"An unexpected error occurred. Our team has been notified.",
			);
		}
		expect(mockReportError).toHaveBeenCalled();
	});

	it("should handle error when error reporting fails", async () => {
		vi.stubEnv("NODE_ENV", "production");
		mockReportError.mockRejectedValueOnce(new Error("Linear API error"));
		delete process.env.RESEND_API_KEY;

		const formData: ContactFormData = {
			name: "John Doe",
			email: "john@example.com",
			message: "This is a test message with enough characters",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(false);
		// Should still return error even if reporting fails
		if (!result.success) {
			expect(result.error).toBe("Email service is not configured");
		}
	});

	it("should handle error when headers() throws during error reporting", async () => {
		vi.stubEnv("NODE_ENV", "production");
		mockHeaders.mockRejectedValueOnce(new Error("Headers error"));
		delete process.env.RESEND_API_KEY;

		const formData: ContactFormData = {
			name: "John Doe",
			email: "john@example.com",
			message: "This is a test message with enough characters",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Email service is not configured");
		}
	});

	it("should handle error when headers() throws during Resend error reporting", async () => {
		vi.stubEnv("NODE_ENV", "production");
		mockResendSend.mockResolvedValueOnce({
			data: null,
			error: { message: "Resend API error" },
		});
		// Make headers throw on the second call (during error reporting)
		mockHeaders
			.mockResolvedValueOnce({ get: mockHeadersGet }) // First call succeeds
			.mockRejectedValueOnce(new Error("Headers error")); // Second call fails

		const formData: ContactFormData = {
			name: "John Doe",
			email: "john@example.com",
			message: "This is a test message with enough characters",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe("Failed to send email");
		}
	});

	it("should handle error when headers() throws during unexpected error reporting", async () => {
		vi.stubEnv("NODE_ENV", "production");
		mockResendSend.mockRejectedValueOnce(new Error("Unexpected error"));
		// Make headers throw during error reporting
		mockHeaders.mockRejectedValueOnce(new Error("Headers error"));

		const formData: ContactFormData = {
			name: "John Doe",
			email: "john@example.com",
			message: "This is a test message with enough characters",
		};

		const result = await submitContactForm(formData);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toBe(
				"An unexpected error occurred. Our team has been notified.",
			);
		}
	});
});
