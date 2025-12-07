"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Props for the CTASection component.
 * @public
 */
export interface CTASectionProps {
	/** Section title */
	title?: string;
	/** Section description */
	description?: string;
	/** Primary call-to-action button configuration */
	primaryAction?: {
		/** Button label */
		label: string;
		/** Button link href */
		href: string;
		/** Show arrow icon */
		showArrow?: boolean;
	};
	/** Secondary call-to-action button configuration */
	secondaryAction?: {
		/** Button label */
		label: string;
		/** Button link href */
		href: string;
		/** Open in new tab */
		external?: boolean;
	};
	/** Additional CSS classes */
	className?: string;
}

/**
 * Call-to-action section component with customizable content and buttons.
 *
 * Displays a prominent CTA section with title, description, and action buttons.
 * Includes smooth scroll-triggered animations.
 *
 * @param props - CTASection configuration props
 * @returns A CTA section React component
 *
 * @example
 * ```tsx
 * <CTASection
 *   title="Ready to Get Started?"
 *   description="Join thousands of happy customers"
 *   primaryAction={{ label: "Sign Up", href: "/signup", showArrow: true }}
 *   secondaryAction={{ label: "Learn More", href: "/about" }}
 * />
 * ```
 */
export function CTASection({
	title,
	description,
	primaryAction,
	secondaryAction,
	className,
}: CTASectionProps) {
	return (
		<section className={`py-20 md:py-32 ${className || ""}`}>
			<div className="container px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="mx-auto max-w-3xl rounded-lg border bg-muted/50 p-8 text-center md:p-12"
				>
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						{title}
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
						{description}
					</p>
					{(primaryAction || secondaryAction) && (
						<div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
							{primaryAction && (
								<Button size="lg" asChild>
									<Link href={primaryAction.href}>
										{primaryAction.label}
										{primaryAction.showArrow && (
											<ArrowRight className="ml-2 h-4 w-4" />
										)}
									</Link>
								</Button>
							)}
							{secondaryAction && (
								<Button size="lg" variant="outline" asChild>
									<Link
										href={secondaryAction.href}
										target={secondaryAction.external ? "_blank" : undefined}
										rel={
											secondaryAction.external
												? "noopener noreferrer"
												: undefined
										}
									>
										{secondaryAction.label}
									</Link>
								</Button>
							)}
						</div>
					)}
				</motion.div>
			</div>
		</section>
	);
}
