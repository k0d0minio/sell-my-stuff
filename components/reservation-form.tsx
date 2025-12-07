"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useActionState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createReservation } from "@/lib/actions/reservations";
import {
	reservationSchema,
	type ReservationFormData,
} from "@/lib/validations/reservation";

interface ReservationFormProps {
	itemId: number;
	itemTitle: string;
}

type FormStatus = {
	type: "success" | "error" | null;
	message: string;
};

async function formAction(
	_prevState: FormStatus | null,
	formData: FormData,
): Promise<FormStatus> {
	try {
		const data: ReservationFormData = {
			itemId: Number.parseInt(formData.get("itemId") as string, 10),
			name: formData.get("name") as string,
			email: formData.get("email") as string,
			phone: (formData.get("phone") as string) || undefined,
			preferredContact: (formData.get("preferredContact") as string) || undefined,
			message: formData.get("message") as string,
		};

		const result = await createReservation(data);

		if (result.success) {
			return {
				type: "success",
				message: "success",
			};
		}

		return {
			type: "error",
			message: result.error || "error",
		};
	} catch (error) {
		return {
			type: "error",
			message: error instanceof Error ? error.message : "error",
		};
	}
}

export function ReservationForm({ itemId, itemTitle }: ReservationFormProps) {
	const [state, formActionWithState] = useActionState(formAction, null);
	const [isPending, startTransition] = useTransition();

	const form = useForm<ReservationFormData>({
		resolver: zodResolver(reservationSchema),
		defaultValues: {
			itemId,
			name: "",
			email: "",
			phone: "",
			preferredContact: "",
			message: "",
		},
	});

	// Reset form on successful submission
	useEffect(() => {
		if (state?.type === "success") {
			form.reset();
		}
	}, [state, form]);

	async function onSubmit(data: ReservationFormData) {
		const formData = new FormData();
		formData.append("itemId", data.itemId.toString());
		formData.append("name", data.name);
		formData.append("email", data.email);
		if (data.phone) {
			formData.append("phone", data.phone);
		}
		if (data.preferredContact) {
			formData.append("preferredContact", data.preferredContact);
		}
		formData.append("message", data.message);

		startTransition(() => {
			formActionWithState(formData);
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="Your name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="your.email@example.com"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Phone</FormLabel>
							<FormControl>
								<Input
									type="tel"
									placeholder="Your phone number (optional)"
									{...field}
									value={field.value || ""}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="preferredContact"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Preferred Contact Method</FormLabel>
							<Select
								onValueChange={field.onChange}
								defaultValue={field.value}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select preferred contact method" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="email">Email</SelectItem>
									<SelectItem value="phone">Phone</SelectItem>
									<SelectItem value="either">Either</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="message"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Message</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Tell us about your interest in this item..."
									className="min-h-[120px]"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{state?.type && (
					<Alert
						variant={state.type === "error" ? "destructive" : "default"}
						role="alert"
						aria-live={state.type === "error" ? "assertive" : "polite"}
					>
						{state.type === "success" ? (
							<CheckCircle2 className="h-4 w-4" />
						) : (
							<AlertCircle className="h-4 w-4" />
						)}
						<AlertDescription>
							{state.message === "success"
								? "Thank you! Your reservation has been submitted. We'll contact you soon."
								: state.message === "error"
									? "Something went wrong. Please try again later."
									: state.message}
						</AlertDescription>
					</Alert>
				)}

				<Button type="submit" disabled={isPending} className="w-full">
					{isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Submitting...
						</>
					) : (
						<>
							<Mail className="mr-2 h-4 w-4" />
							Reserve Item
						</>
					)}
				</Button>
			</form>
		</Form>
	);
}

