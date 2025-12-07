import { z } from "zod";

export const reservationSchema = z.object({
	itemId: z.number().int().positive(),
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().optional(),
	preferredContact: z.string().optional(),
	message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;

