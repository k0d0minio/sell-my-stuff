"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { collectErrorContext } from "@/lib/errors/reporter";
import { getLinearErrorReporter } from "@/lib/linear/errors";
import {
	type ContactFormData,
	contactFormSchema,
} from "@/lib/validations/contact";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Result type for contact form submission actions.
 * @public
 */
export type ContactActionResult =
	| { success: true; message: string; id?: string }
	| { success: false; error: string };

/**
 * Server Action to handle contact form submissions.
 *
 * Validates form data, sends email via Resend, and reports errors to Linear in production.
 * This function is designed to be called from client components using React Server Actions.
 *
 * @param data - The contact form data to submit
 * @returns A promise that resolves to a ContactActionResult indicating success or failure
 *
 * @example
 * ```tsx
 * const result = await submitContactForm({
 *   name: "John Doe",
 *   email: "john@example.com",
 *   message: "Hello, world!"
 * });
 *
 * if (result.success) {
 *   console.log("Email sent:", result.id);
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export async function submitContactForm(
	data: ContactFormData,
): Promise<ContactActionResult> {
	try {
		// Validate the form data
		const validationResult = contactFormSchema.safeParse(data);

		if (!validationResult.success) {
			return {
				success: false,
				error: "Invalid form data",
			};
		}

		const { name, email, message } = validationResult.data;

		// Check for required environment variables
		if (!process.env.RESEND_API_KEY) {
			console.error("RESEND_API_KEY is not configured");

			// Report error to Linear (non-blocking)
			if (process.env.NODE_ENV === "production") {
				try {
					const headersList = await headers();
					const url =
						headersList.get("referer") || headersList.get("x-url") || undefined;
					const userAgent = headersList.get("user-agent") || undefined;

					const context = collectErrorContext(
						new Error("RESEND_API_KEY is not configured"),
						{
							url,
							userAgent,
							requestMethod: "POST",
							additionalData: {
								formData: { name, email },
							},
						},
					);

					const reporter = getLinearErrorReporter();
					reporter.reportError(context).catch((reportError) => {
						console.error("Failed to report error to Linear:", reportError);
					});
				} catch (reportError) {
					console.error("Failed to collect error context:", reportError);
				}
			}

			return {
				success: false,
				error: "Email service is not configured",
			};
		}

		const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
		const toEmail = process.env.RESEND_TO_EMAIL || "delivered@resend.dev";

		// Send email using Resend
		const { data: emailData, error } = await resend.emails.send({
			from: fromEmail,
			to: toEmail,
			replyTo: email,
			subject: `Contact Form Submission from ${name}`,
			html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
			text: `
        New Contact Form Submission
        
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
		});

		if (error) {
			console.error("Resend error:", error);

			// Report error to Linear (non-blocking)
			if (process.env.NODE_ENV === "production") {
				try {
					const headersList = await headers();
					const url =
						headersList.get("referer") || headersList.get("x-url") || undefined;
					const userAgent = headersList.get("user-agent") || undefined;

					const context = collectErrorContext(
						new Error(`Resend API error: ${JSON.stringify(error)}`),
						{
							url,
							userAgent,
							requestMethod: "POST",
							additionalData: {
								resendError: error,
								formData: { name, email },
							},
						},
					);

					const reporter = getLinearErrorReporter();
					reporter.reportError(context).catch((reportError) => {
						console.error("Failed to report error to Linear:", reportError);
					});
				} catch (reportError) {
					console.error("Failed to collect error context:", reportError);
				}
			}

			return {
				success: false,
				error: "Failed to send email",
			};
		}

		return {
			success: true,
			message: "Email sent successfully",
			id: emailData?.id,
		};
	} catch (error) {
		// Handle unexpected errors
		console.error("Unexpected error in submitContactForm:", error);

		// Report error to Linear (non-blocking)
		if (process.env.NODE_ENV === "production") {
			try {
				const headersList = await headers();
				const url =
					headersList.get("referer") || headersList.get("x-url") || undefined;
				const userAgent = headersList.get("user-agent") || undefined;

				const context = collectErrorContext(error, {
					url,
					userAgent,
					requestMethod: "POST",
					additionalData: {
						formData: data,
					},
				});

				const reporter = getLinearErrorReporter();
				reporter.reportError(context).catch((reportError) => {
					console.error("Failed to report error to Linear:", reportError);
				});
			} catch (reportError) {
				console.error("Failed to collect error context:", reportError);
			}
		}

		return {
			success: false,
			error: "An unexpected error occurred. Our team has been notified.",
		};
	}
}
