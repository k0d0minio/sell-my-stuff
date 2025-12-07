"use client";

import {
	Facebook,
	Github,
	Instagram,
	Linkedin,
	Mail,
	MapPin,
	Phone,
	Twitter,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || "Second Hand Store";
const siteDescription =
	process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
	"Find great deals on second-hand items";
const businessEmail = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "";
const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "";
const businessAddress = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "";

const socialLinks = [
	{
		url: process.env.NEXT_PUBLIC_SOCIAL_TWITTER,
		icon: Twitter,
		label: "Twitter",
	},
	{
		url: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN,
		icon: Linkedin,
		label: "LinkedIn",
	},
	{ url: process.env.NEXT_PUBLIC_SOCIAL_GITHUB, icon: Github, label: "GitHub" },
	{
		url: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
		icon: Facebook,
		label: "Facebook",
	},
	{
		url: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
		icon: Instagram,
		label: "Instagram",
	},
].filter((link) => link.url);

export function Footer() {
	const currentYear = new Date().getFullYear();

	const footerLinks = {
		legal: [
			{ href: "/privacy", label: "Privacy" },
			{ href: "/terms", label: "Terms" },
			{ href: "/cookies", label: "Cookies" },
		],
	};

	return (
		<footer className="border-t bg-background">
			<div className="container px-4 py-12 md:py-16">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
					{/* Brand */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold">{businessName}</h3>
						<p className="text-sm text-muted-foreground">{siteDescription}</p>
						{(businessEmail || businessPhone || businessAddress) && (
							<div className="space-y-2 text-sm text-muted-foreground">
								{businessEmail && (
									<div className="flex items-center gap-2">
										<Mail className="h-4 w-4" aria-hidden="true" />
										<a
											href={`mailto:${businessEmail}`}
											className="hover:text-foreground transition-colors"
											aria-label={`Email us at ${businessEmail}`}
										>
											{businessEmail}
										</a>
									</div>
								)}
								{businessPhone && (
									<div className="flex items-center gap-2">
										<Phone className="h-4 w-4" aria-hidden="true" />
										<a
											href={`tel:${businessPhone.replace(/\s/g, "")}`}
											className="hover:text-foreground transition-colors"
											aria-label={`Call us at ${businessPhone}`}
										>
											{businessPhone}
										</a>
									</div>
								)}
								{businessAddress && (
									<div className="flex items-start gap-2">
										<MapPin className="h-4 w-4 mt-0.5" aria-hidden="true" />
										<span>{businessAddress}</span>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Legal Links */}
					<nav aria-label="Legal navigation">
						<h4 className="mb-4 text-sm font-semibold">Legal</h4>
						<ul className="space-y-2">
							{footerLinks.legal.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>

				<Separator className="my-8" />

				<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
					<p className="text-sm text-muted-foreground">
						© {currentYear} {businessName}. All rights reserved.
					</p>
					{socialLinks.length > 0 && (
						<div className="flex items-center space-x-4">
							{socialLinks.map(({ url, icon: Icon, label }) => (
								<a
									key={label}
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-muted-foreground hover:text-foreground transition-colors"
									aria-label={label}
								>
									<Icon className="h-5 w-5" />
								</a>
							))}
						</div>
					)}
				</div>
			</div>
		</footer>
	);
}
