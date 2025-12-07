"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "cookie-consent";

type CookieConsentStatus = "accepted" | "declined" | null;

export function CookieConsent() {
	const [showBanner, setShowBanner] = useState(false);

	useEffect(() => {
		// Check if user has already made a choice
		const consent = localStorage.getItem(
			COOKIE_CONSENT_KEY,
		) as CookieConsentStatus;
		if (!consent) {
			// Small delay to ensure smooth page load
			const timer = setTimeout(() => {
				setShowBanner(true);
			}, 500);
			return () => clearTimeout(timer);
		}
	}, []);

	const handleAccept = () => {
		localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
		setShowBanner(false);
	};

	const handleDecline = () => {
		localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
		setShowBanner(false);
	};

	if (!showBanner) {
		return null;
	}

	return (
		<div
			role="dialog"
			aria-label="Cookie consent"
			aria-modal="false"
			className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 shadow-lg"
		>
			<div className="container px-4 py-4">
				<div className="mx-auto flex max-w-4xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex-1 space-y-2">
						<p className="text-sm text-foreground">
							We use cookies to enhance your browsing experience, analyze site
							traffic, and personalize content. By clicking "Accept", you
							consent to our use of cookies.{" "}
							<Link
								href="/cookies"
								className="text-primary underline hover:no-underline"
							>
								Learn more
							</Link>
						</p>
					</div>
					<div className="flex flex-shrink-0 items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleDecline}
							aria-label="Decline cookies"
						>
							Decline
						</Button>
						<Button
							size="sm"
							onClick={handleAccept}
							aria-label="Accept cookies"
						>
							Accept
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleDecline}
							aria-label="Close cookie consent banner"
							className="h-8 w-8"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
