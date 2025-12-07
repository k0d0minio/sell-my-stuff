"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.5,
		},
	},
};

/**
 * Props for the HeroSection component.
 * @public
 */
export interface HeroSectionProps {
	/** Main headline text */
	title: string;
	/** Subtitle text (displayed in muted color) */
	subtitle?: string;
	/** Description paragraph text */
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
	};
	/** Additional CSS classes */
	className?: string;
}

/**
 * Hero section component with animated content and call-to-action buttons.
 *
 * Displays a prominent hero section with customizable title, subtitle, description,
 * and action buttons. Includes smooth animations using Framer Motion.
 *
 * @param props - HeroSection configuration props
 * @returns A hero section React component
 *
 * @example
 * ```tsx
 * <HeroSection
 *   title="Welcome to Our Site"
 *   subtitle="Building the Future"
 *   description="We create amazing products"
 *   primaryAction={{ label: "Get Started", href: "/signup", showArrow: true }}
 *   secondaryAction={{ label: "Learn More", href: "/about" }}
 * />
 * ```
 */
export function HeroSection({
	title,
	subtitle,
	description,
	primaryAction,
	secondaryAction,
	className,
}: HeroSectionProps) {
	return (
		<section
			className={`relative overflow-hidden border-b py-20 md:py-32 ${className || ""}`}
		>
			<div className="container px-4">
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="mx-auto max-w-3xl text-center"
				>
					<motion.h1
						variants={itemVariants}
						className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
					>
						{title}
						{subtitle && (
							<span className="block text-muted-foreground">{subtitle}</span>
						)}
					</motion.h1>

					{description && (
						<motion.p
							variants={itemVariants}
							className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
						>
							{description}
						</motion.p>
					)}

					{(primaryAction || secondaryAction) && (
						<motion.div
							variants={itemVariants}
							className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
						>
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
									<Link href={secondaryAction.href}>
										{secondaryAction.label}
									</Link>
								</Button>
							)}
						</motion.div>
					)}
				</motion.div>
			</div>
		</section>
	);
}
