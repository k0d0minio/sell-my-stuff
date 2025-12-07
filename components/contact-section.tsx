"use client";

import { ContactForm } from "@/components/contact-form";

export function ContactSection() {
	return (
		<section id="contact" className="py-20 md:py-32">
			<div className="container px-4">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						Questions about an item?
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						Have a question about an item? Send me a message and I'll get back to you as soon as possible.
					</p>
				</div>
				<div className="mx-auto mt-12 max-w-2xl">
					<ContactForm />
				</div>
			</div>
		</section>
	);
}
