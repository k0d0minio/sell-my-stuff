"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

const businessName =
	process.env.NEXT_PUBLIC_BUSINESS_NAME ||
	process.env.NEXT_PUBLIC_SITE_NAME ||
	"Logo";

export function Header() {
	const t = useTranslations("header");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const navItems = [
		{ href: "/", label: t("home") },
		{ href: "/#features", label: t("features") },
		{ href: "/#contact", label: t("contact") },
	];

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<nav className="container flex h-16 items-center justify-between px-4">
				<Link
					href="/"
					className="flex items-center space-x-2"
					aria-label={`${businessName} - ${t("home")}`}
				>
					<span className="text-xl font-bold">{businessName}</span>
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden md:flex md:items-center md:space-x-6">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							{item.label}
						</Link>
					))}
					<Button size="sm">{t("getStarted")}</Button>
				</div>

				{/* Mobile Menu Button */}
				<Button
					variant="ghost"
					size="icon"
					className="md:hidden"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
					aria-expanded={mobileMenuOpen}
					aria-controls="mobile-navigation"
				>
					{mobileMenuOpen ? (
						<X className="h-6 w-6" aria-hidden="true" />
					) : (
						<Menu className="h-6 w-6" aria-hidden="true" />
					)}
				</Button>
			</nav>

			{/* Mobile Navigation */}
			<AnimatePresence>
				{mobileMenuOpen && (
					<motion.div
						id="mobile-navigation"
						role="menu"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="border-t md:hidden"
					>
						<div className="container space-y-2 px-4 py-4">
							{navItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									role="menuitem"
									className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
									onClick={() => setMobileMenuOpen(false)}
								>
									{item.label}
								</Link>
							))}
							<Button className="w-full mt-4" size="sm">
								{t("getStarted")}
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}
