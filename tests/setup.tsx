import React from "react";
import { afterEach, vi } from "vitest";

// Import React Testing Library utilities (only used in jsdom environment)
try {
	const { cleanup } = await import("@testing-library/react");
	await import("@testing-library/jest-dom");

	// Cleanup after each test (only in jsdom environment)
	afterEach(() => {
		cleanup();
	});
} catch {
	// Ignore if not in jsdom environment (e.g., node environment for API tests)
}

// Mock Next.js router
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		refresh: vi.fn(),
	}),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
	default: (props: Record<string, unknown>) => {
		// eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
		return React.createElement("img", props);
	},
}));
