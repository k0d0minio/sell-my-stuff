import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "./contact-form";

// Mock the Server Action
vi.mock("@/lib/actions/contact", () => ({
	submitContactForm: vi.fn(),
}));

import { submitContactForm } from "@/lib/actions/contact";

const mockSubmitContactForm = vi.mocked(submitContactForm);

// Mock messages for NextIntl
const mockMessages = {
	contact: {
		form: {
			name: "Name",
			namePlaceholder: "Your name",
			email: "Email",
			emailPlaceholder: "your.email@example.com",
			message: "Message",
			messagePlaceholder: "Your message...",
			sendMessage: "Send Message",
			sending: "Sending...",
			sendingAriaLabel: "Sending message",
			sendAriaLabel: "Send message",
			success: "Thank you! Your message has been sent successfully.",
			error: "Something went wrong. Please try again later.",
		},
	},
	validation: {
		nameMinLength: "Name must be at least 2 characters",
		emailInvalid: "Please enter a valid email address",
		messageMinLength: "Message must be at least 10 characters",
	},
};

const renderWithIntl = (component: React.ReactElement) => {
	return render(
		<NextIntlClientProvider locale="en" messages={mockMessages}>
			{component}
		</NextIntlClientProvider>,
	);
};

describe("ContactForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should render all form fields", () => {
		renderWithIntl(<ContactForm />);

		expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
		expect(
			screen.getByRole("textbox", { name: /^message$/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /send message/i }),
		).toBeInTheDocument();
	});

	it("should display validation errors for empty fields", async () => {
		const user = userEvent.setup();
		renderWithIntl(<ContactForm />);

		const submitButton = screen.getByRole("button", { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText(/name must be at least 2 characters/i),
			).toBeInTheDocument();
		});
	});

	it("should display validation error for name shorter than 2 characters", async () => {
		const user = userEvent.setup();
		renderWithIntl(<ContactForm />);

		const nameInput = screen.getByLabelText(/name/i);
		await user.type(nameInput, "J");

		const submitButton = screen.getByRole("button", { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText(/name must be at least 2 characters/i),
			).toBeInTheDocument();
		});
	});

	it("should display validation error for invalid email", async () => {
		const user = userEvent.setup();
		renderWithIntl(<ContactForm />);

		const nameInput = screen.getByLabelText(/^name$/i);
		const emailInput = screen.getByLabelText(/^email$/i) as HTMLInputElement;
		const messageInput = screen.getByRole("textbox", { name: /^message$/i });

		// Fill in other required fields first
		await user.type(nameInput, "John Doe");
		// Use an email format that passes HTML5 validation but fails Zod validation
		// HTML5 accepts "a@b" but Zod requires a proper domain
		await user.clear(emailInput);
		await user.type(emailInput, "a@b");
		await user.type(
			messageInput,
			"This is a valid message with enough characters",
		);

		const submitButton = screen.getByRole("button", { name: /send message/i });
		await user.click(submitButton);

		await waitFor(
			() => {
				expect(
					screen.getByText(/please enter a valid email address/i),
				).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);
	});

	it("should display validation error for message shorter than 10 characters", async () => {
		const user = userEvent.setup();
		renderWithIntl(<ContactForm />);

		const messageInput = screen.getByRole("textbox", { name: /^message$/i });
		await user.type(messageInput, "Short");

		const submitButton = screen.getByRole("button", { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText(/message must be at least 10 characters/i),
			).toBeInTheDocument();
		});
	});

	it("should submit form with valid data", async () => {
		const user = userEvent.setup();
		mockSubmitContactForm.mockResolvedValueOnce({
			success: true,
			message: "Email sent successfully",
			id: "123",
		});

		renderWithIntl(<ContactForm />);

		await user.type(screen.getByLabelText(/^name$/i), "John Doe");
		await user.type(screen.getByLabelText(/^email$/i), "john@example.com");
		await user.type(
			screen.getByRole("textbox", { name: /^message$/i }),
			"This is a valid message with enough characters",
		);

		const submitButton = screen.getByRole("button", { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockSubmitContactForm).toHaveBeenCalledWith({
				name: "John Doe",
				email: "john@example.com",
				message: "This is a valid message with enough characters",
			});
		});
	});

	it("should display success message after successful submission", async () => {
		const user = userEvent.setup();
		mockSubmitContactForm.mockResolvedValueOnce({
			success: true,
			message: "Email sent successfully",
			id: "123",
		});

		renderWithIntl(<ContactForm />);

		await user.type(screen.getByLabelText(/^name$/i), "John Doe");
		await user.type(screen.getByLabelText(/^email$/i), "john@example.com");
		await user.type(
			screen.getByRole("textbox", { name: /^message$/i }),
			"This is a valid message with enough characters",
		);

		const submitButton = screen.getByRole("button", { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText(/thank you! your message has been sent successfully/i),
			).toBeInTheDocument();
		});
	});

	it("should reset form after successful submission", async () => {
		const user = userEvent.setup();
		mockSubmitContactForm.mockResolvedValueOnce({
			success: true,
			message: "Email sent successfully",
			id: "123",
		});

		renderWithIntl(<ContactForm />);

		const nameInput = screen.getByLabelText(/^name$/i) as HTMLInputElement;
		const emailInput = screen.getByLabelText(/^email$/i) as HTMLInputElement;
		const messageInput = screen.getByRole("textbox", {
			name: /^message$/i,
		}) as HTMLTextAreaElement;

		await user.type(nameInput, "John Doe");
		await user.type(emailInput, "john@example.com");
		await user.type(
			messageInput,
			"This is a valid message with enough characters",
		);

		const submitButton = screen.getByRole("button", { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(nameInput.value).toBe("");
			expect(emailInput.value).toBe("");
			expect(messageInput.value).toBe("");
		});
	});

	it("should display error message when Server Action returns error", async () => {
		const user = userEvent.setup();
		mockSubmitContactForm.mockResolvedValueOnce({
			success: false,
			error: "Failed to send email",
		});

		renderWithIntl(<ContactForm />);

		await user.type(screen.getByLabelText(/^name$/i), "John Doe");
		await user.type(screen.getByLabelText(/^email$/i), "john@example.com");
		await user.type(
			screen.getByRole("textbox", { name: /^message$/i }),
			"This is a valid message with enough characters",
		);

		const submitButton = screen.getByRole("button", { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/failed to send email/i)).toBeInTheDocument();
		});
	});

	it("should display error message when Server Action throws", async () => {
		const user = userEvent.setup();
		mockSubmitContactForm.mockRejectedValueOnce(new Error("Network error"));

		renderWithIntl(<ContactForm />);

		await user.type(screen.getByLabelText(/^name$/i), "John Doe");
		await user.type(screen.getByLabelText(/^email$/i), "john@example.com");
		await user.type(
			screen.getByRole("textbox", { name: /^message$/i }),
			"This is a valid message with enough characters",
		);

		const submitButton = screen.getByRole("button", { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/network error/i)).toBeInTheDocument();
		});
	});

	it("should disable submit button while submitting", async () => {
		const user = userEvent.setup();
		let resolveAction:
			| ((value: { success: true; message: string }) => void)
			| undefined;
		const actionPromise = new Promise<{ success: true; message: string }>(
			(resolve) => {
				resolveAction = resolve;
			},
		);
		mockSubmitContactForm.mockReturnValueOnce(actionPromise);

		renderWithIntl(<ContactForm />);

		await user.type(screen.getByLabelText(/^name$/i), "John Doe");
		await user.type(screen.getByLabelText(/^email$/i), "john@example.com");
		await user.type(
			screen.getByRole("textbox", { name: /^message$/i }),
			"This is a valid message with enough characters",
		);

		const submitButton = screen.getByRole("button", { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(submitButton).toBeDisabled();
			expect(screen.getByText(/sending.../i)).toBeInTheDocument();
		});

		if (resolveAction) {
			resolveAction({
				success: true,
				message: "Email sent successfully",
			});
		}

		await waitFor(() => {
			expect(submitButton).not.toBeDisabled();
		});
	});

	it("should show loading state during submission", async () => {
		const user = userEvent.setup();
		let resolveAction:
			| ((value: { success: true; message: string }) => void)
			| undefined;
		const actionPromise = new Promise<{ success: true; message: string }>(
			(resolve) => {
				resolveAction = resolve;
			},
		);
		mockSubmitContactForm.mockReturnValueOnce(actionPromise);

		renderWithIntl(<ContactForm />);

		await user.type(screen.getByLabelText(/^name$/i), "John Doe");
		await user.type(screen.getByLabelText(/^email$/i), "john@example.com");
		await user.type(
			screen.getByRole("textbox", { name: /^message$/i }),
			"This is a valid message with enough characters",
		);

		const submitButton = screen.getByRole("button", { name: /send message/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/sending.../i)).toBeInTheDocument();
		});

		if (resolveAction) {
			resolveAction({
				success: true,
				message: "Email sent successfully",
			});
		}

		await waitFor(() => {
			expect(screen.queryByText(/sending.../i)).not.toBeInTheDocument();
		});
	});
});
