"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { formatCurrency } from "@/lib/currency";
import { query } from "@/lib/db/client";
import { collectErrorContext } from "@/lib/errors/reporter";
import { getLinearErrorReporter } from "@/lib/linear/errors";
import { reservationSchema, type ReservationFormData } from "@/lib/validations/reservation";
import { getItemById } from "./items";

const resend = new Resend(process.env.RESEND_API_KEY);

export type ReservationActionResult =
	| { success: true; message: string; id?: number }
	| { success: false; error: string };

/**
 * Create a reservation and send email notification.
 */
export async function createReservation(
	data: ReservationFormData,
): Promise<ReservationActionResult> {
	try {
		const validation = reservationSchema.safeParse(data);
		if (!validation.success) {
			return {
				success: false,
				error: validation.error.errors[0]?.message || "Invalid reservation data",
			};
		}

		const { itemId, name, email, phone, preferredContact, message } =
			validation.data;

		// Verify item exists
		const item = await getItemById(itemId);
		if (!item) {
			return { success: false, error: "Item not found" };
		}

		// Save reservation to database
		const result = await query<{ id: number }>(
			`
			INSERT INTO reservations (item_id, name, email, phone, preferred_contact, message, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
			RETURNING id
		`,
			[itemId, name, email, phone || null, preferredContact || null, message],
		);

		const reservationId = result[0]?.id;
		if (!reservationId) {
			return { success: false, error: "Failed to create reservation" };
		}

		// Send email notification
		if (!process.env.RESEND_API_KEY) {
			console.error("RESEND_API_KEY is not configured - email notification will not be sent");

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
								reservationId,
								itemId,
								customerEmail: email,
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
			// Continue with reservation success even if email can't be sent
		} else {
			const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
			const toEmail = process.env.RESEND_EMAIL_TO || "delivered@resend.dev";

			const emailHtml = `
				<h2>New Item Reservation</h2>
				<p><strong>Item:</strong> ${item.title}</p>
				<p><strong>Price:</strong> ${formatCurrency(item.price)}</p>
				<p><strong>Category:</strong> ${item.category}</p>
				<hr>
				<h3>Customer Information</h3>
				<p><strong>Name:</strong> ${name}</p>
				<p><strong>Email:</strong> ${email}</p>
				${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
				${preferredContact ? `<p><strong>Preferred Contact:</strong> ${preferredContact}</p>` : ""}
				<hr>
				<h3>Message</h3>
				<p>${message.replace(/\n/g, "<br>")}</p>
				<hr>
				<p><small>Reservation ID: ${reservationId}</small></p>
			`;

			const emailText = `
New Item Reservation

Item: ${item.title}
Price: ${formatCurrency(item.price)}
Category: ${item.category}

Customer Information:
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ""}
${preferredContact ? `Preferred Contact: ${preferredContact}` : ""}

Message:
${message}

Reservation ID: ${reservationId}
			`;

			const { error: emailError } = await resend.emails.send({
				from: fromEmail,
				to: toEmail,
				replyTo: email,
				subject: `New Reservation: ${item.title}`,
				html: emailHtml,
				text: emailText,
			});

			if (emailError) {
				console.error("Resend error:", emailError);

				// Report error to Linear (non-blocking)
				if (process.env.NODE_ENV === "production") {
					try {
						const headersList = await headers();
						const url =
							headersList.get("referer") || headersList.get("x-url") || undefined;
						const userAgent = headersList.get("user-agent") || undefined;

						const context = collectErrorContext(
							new Error(`Resend API error: ${JSON.stringify(emailError)}`),
							{
								url,
								userAgent,
								requestMethod: "POST",
								additionalData: {
									resendError: emailError,
									reservationId,
									itemId,
									customerEmail: email,
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
				// Don't fail the reservation if email fails
			}
		}

		return {
			success: true,
			message: "Reservation submitted successfully",
			id: reservationId,
		};
	} catch (error) {
		console.error("Create reservation error:", error);

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
						reservationData: data,
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
			error: error instanceof Error ? error.message : "Failed to create reservation",
		};
	}
}

