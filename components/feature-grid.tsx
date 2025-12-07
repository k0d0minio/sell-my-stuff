"use client";

import { motion } from "framer-motion";
import { Code, type LucideIcon, Rocket, Shield, Zap } from "lucide-react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

// Icon mapping for server-to-client component compatibility
const iconMap: Record<string, LucideIcon> = {
	zap: Zap,
	shield: Shield,
	code: Code,
	rocket: Rocket,
};

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const cardVariants = {
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
 * A single feature item in the feature grid.
 * @public
 */
export interface FeatureItem {
	/** Icon name (e.g., "zap", "shield", "code", "rocket") - must be a key in iconMap */
	icon: string;
	/** Feature title */
	title: string;
	/** Feature description */
	description: string;
}

/**
 * Props for the FeatureGrid component.
 * @public
 */
export interface FeatureGridProps {
	/** Section title */
	title?: string;
	/** Section description */
	description?: string;
	/** Array of features to display */
	features?: FeatureItem[];
	/** Section ID for anchor links */
	id?: string;
	/** Additional CSS classes */
	className?: string;
}

/**
 * Feature grid component displaying a collection of features with icons and descriptions.
 *
 * Displays a grid of feature cards with smooth scroll-triggered animations.
 * Each feature includes an icon, title, and description.
 *
 * @param props - FeatureGrid configuration props
 * @returns A feature grid React component
 *
 * @example
 * ```tsx
 * <FeatureGrid
 *   title="Our Features"
 *   description="Everything you need to succeed"
 *   features={[
 *     { icon: "zap", title: "Fast", description: "Lightning fast performance" },
 *     { icon: "shield", title: "Secure", description: "Enterprise-grade security" }
 *   ]}
 * />
 * ```
 */
export function FeatureGrid({
	title,
	description,
	features,
	id = "features",
	className,
}: FeatureGridProps) {
	return (
		<section id={id} className={`py-20 md:py-32 ${className || ""}`}>
			<div className="container px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="mx-auto max-w-2xl text-center"
				>
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						{title}
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">{description}</p>
				</motion.div>

				{features && features.length > 0 && (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
					>
						{features.map((feature) => {
							const Icon = iconMap[feature.icon.toLowerCase()];
							if (!Icon) {
								console.warn(`Icon "${feature.icon}" not found in iconMap`);
								return null;
							}
							return (
								<motion.div key={feature.title} variants={cardVariants}>
									<Card className="h-full">
										<CardHeader>
											<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
												<Icon className="h-6 w-6 text-primary" />
											</div>
											<CardTitle>{feature.title}</CardTitle>
											<CardDescription>{feature.description}</CardDescription>
										</CardHeader>
									</Card>
								</motion.div>
							);
						})}
					</motion.div>
				)}
			</div>
		</section>
	);
}
