const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_CURRENCY_LOCALE || "en-US";

export const DEFAULT_CURRENCY = "EUR";

const euroFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
	style: "currency",
	currency: DEFAULT_CURRENCY,
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

/**
 * Format a numeric value using the default currency configuration.
 */
export function formatCurrency(amount: number): string {
	if (!Number.isFinite(amount)) {
		return euroFormatter.format(0);
	}

	return euroFormatter.format(amount);
}
