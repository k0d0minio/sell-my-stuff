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
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/lib/actions/contact";
import {
	type ContactFormData,
	contactFormSchema,
} from "@/lib/validations/contact";

type FormStatus = {
	type: "success" | "error" | null;
	message: string;
};

/**
 * Submit button component with loading state.
 * @internal
 */
function SubmitButton({ pending }: { pending: boolean }) {
	return (
		<Button
			type="submit"
			disabled={pending}
			className="w-full"
			aria-label={pending ? "Sending message" : "Send message"}
		>
			{pending ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
					Sending...
				</>
			) : (
				<>
					<Mail className="mr-2 h-4 w-4" aria-hidden="true" />
					Send Message
				</>
			)}
		</Button>
	);
}

async function formAction(
	_prevState: FormStatus | null,
	formData: FormData,
): Promise<FormStatus> {
	try {
		const data: ContactFormData = {
			name: formData.get("name") as string,
			email: formData.get("email") as string,
			message: formData.get("message") as string,
		};

		// Server action handles validation, so we just pass the data
		const result = await submitContactForm(data);

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

/**
 * Contact form component with validation and error handling.
 *
 * A fully accessible contact form with client-side validation using React Hook Form
 * and Zod, server-side validation via server actions, and comprehensive error handling.
 * Includes loading states, success/error messages, and automatic form reset on success.
 *
 * @returns A contact form React component
 *
 * @example
 * ```tsx
 * <ContactForm />
 * ```
 */
export function ContactForm() {
	const [state, formActionWithState] = useActionState(formAction, null);
	const [isPending, startTransition] = useTransition();

	const form = useForm<ContactFormData>({
		resolver: zodResolver(contactFormSchema),
		defaultValues: {
			name: "",
			email: "",
			message: "",
		},
	});

	// Reset form on successful submission
	useEffect(() => {
		if (state?.type === "success") {
			form.reset();
		}
	}, [state, form]);

	async function onSubmit(data: ContactFormData) {
		const formData = new FormData();
		formData.append("name", data.name);
		formData.append("email", data.email);
		formData.append("message", data.message);
		startTransition(() => {
			formActionWithState(formData);
		});
	}

	return (
		<div className="w-full max-w-2xl mx-auto">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
						name="message"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Message</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Your message..."
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
								<CheckCircle2 className="h-4 w-4" aria-hidden="true" />
							) : (
								<AlertCircle className="h-4 w-4" aria-hidden="true" />
							)}
							<AlertDescription>
								{state.message === "success"
									? "Thank you! Your message has been sent successfully."
									: state.message === "error"
										? "Something went wrong. Please try again later."
										: state.message}
							</AlertDescription>
						</Alert>
					)}

					<SubmitButton pending={isPending} />
				</form>
			</Form>
		</div>
	);
}
