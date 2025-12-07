"use client";

import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { locales } from "@/i18n/config";
import { Link, usePathname } from "@/i18n/routing";

const localeNames: Record<string, string> = {
	en: "English",
	es: "Español",
	fr: "Français",
	de: "Deutsch",
};

export function LanguageSwitcher() {
	const locale = useLocale();
	const pathname = usePathname();

	return (
		<div className="flex items-center gap-2">
			{locales.map((loc) => (
				<Link key={loc} href={pathname} locale={loc}>
					<Button variant={locale === loc ? "default" : "ghost"} size="sm">
						{localeNames[loc] || loc}
					</Button>
				</Link>
			))}
		</div>
	);
}
