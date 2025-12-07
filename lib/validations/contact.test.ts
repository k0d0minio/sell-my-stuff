import { describe, expect, it } from "vitest";
import { type ContactFormData, contactFormSchema } from "./contact";

describe("contactFormSchema", () => {
	describe("valid inputs", () => {
		it("should validate a complete valid form", () => {
			const validData: ContactFormData = {
				name: "John Doe",
				email: "john@example.com",
				message: "This is a valid message with enough characters",
			};

			const result = contactFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(validData);
			}
		});

		it("should validate with minimum required lengths", () => {
			const validData: ContactFormData = {
				name: "Jo",
				email: "a@b.co",
				message: "1234567890", // exactly 10 characters
			};

			const result = contactFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	describe("invalid inputs", () => {
		it("should reject name shorter than 2 characters", () => {
			const invalidData = {
				name: "J",
				email: "john@example.com",
				message: "This is a valid message",
			};

			const result = contactFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.errors[0].path).toContain("name");
				expect(result.error.errors[0].message).toContain(
					"at least 2 characters",
				);
			}
		});

		it("should reject empty name", () => {
			const invalidData = {
				name: "",
				email: "john@example.com",
				message: "This is a valid message",
			};

			const result = contactFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("should reject invalid email format", () => {
			const invalidData = {
				name: "John Doe",
				email: "not-an-email",
				message: "This is a valid message",
			};

			const result = contactFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.errors[0].path).toContain("email");
				expect(result.error.errors[0].message).toContain("valid email");
			}
		});

		it("should reject email without @ symbol", () => {
			const invalidData = {
				name: "John Doe",
				email: "johnexample.com",
				message: "This is a valid message",
			};

			const result = contactFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("should reject message shorter than 10 characters", () => {
			const invalidData = {
				name: "John Doe",
				email: "john@example.com",
				message: "Short",
			};

			const result = contactFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.errors[0].path).toContain("message");
				expect(result.error.errors[0].message).toContain(
					"at least 10 characters",
				);
			}
		});

		it("should reject empty message", () => {
			const invalidData = {
				name: "John Doe",
				email: "john@example.com",
				message: "",
			};

			const result = contactFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("should reject missing required fields", () => {
			const invalidData = {
				name: "John Doe",
				// email missing
				message: "This is a valid message",
			};

			const result = contactFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("should reject all fields missing", () => {
			const invalidData = {};

			const result = contactFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe("edge cases", () => {
		it("should handle very long valid inputs", () => {
			const validData: ContactFormData = {
				name: "A".repeat(100),
				email: `${"a".repeat(50)}@example.com`,
				message: "A".repeat(1000),
			};

			const result = contactFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should handle email with special characters", () => {
			const validData: ContactFormData = {
				name: "John Doe",
				email: "john.doe+test@example.co.uk",
				message: "This is a valid message",
			};

			const result = contactFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("should handle message with newlines", () => {
			const validData: ContactFormData = {
				name: "John Doe",
				email: "john@example.com",
				message: "Line 1\nLine 2\nLine 3",
			};

			const result = contactFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});
});
