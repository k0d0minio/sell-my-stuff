import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CTASection } from "./cta-section";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", async () => {
	const actual = await vi.importActual("framer-motion");
	return {
		...actual,
		motion: {
			div: ({
				children,
				initial,
				animate,
				whileInView,
				viewport,
				transition,
				variants,
				...props
			}: {
				children: React.ReactNode;
				[key: string]: unknown;
			}) => <div {...props}>{children}</div>,
		},
	};
});

describe("CTASection", () => {
	it("should render with default props", () => {
		render(
			<CTASection
				title="Ready to Get Started?"
				description="Start building your next website"
				primaryAction={{ label: "Get Started", href: "/" }}
			/>,
		);

		expect(screen.getByText("Ready to Get Started?")).toBeInTheDocument();
		expect(
			screen.getByText(/start building your next website/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /get started/i }),
		).toBeInTheDocument();
	});

	it("should render with custom props", () => {
		render(
			<CTASection
				title="Join Us Today"
				description="Become part of our community"
				primaryAction={{ label: "Sign Up", href: "/signup" }}
				secondaryAction={{ label: "Learn More", href: "/about" }}
			/>,
		);

		expect(screen.getByText("Join Us Today")).toBeInTheDocument();
		expect(
			screen.getByText("Become part of our community"),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /learn more/i }),
		).toBeInTheDocument();
	});

	it("should show arrow icon when showArrow is true", () => {
		render(
			<CTASection
				primaryAction={{ label: "Get Started", href: "/", showArrow: true }}
			/>,
		);

		const link = screen.getByRole("link", { name: /get started/i });
		expect(link.querySelector("svg")).toBeInTheDocument();
	});

	it("should open external links in new tab", () => {
		render(
			<CTASection
				secondaryAction={{
					label: "External Link",
					href: "https://example.com",
					external: true,
				}}
			/>,
		);

		const link = screen.getByRole("link", { name: /external link/i });
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("should not open internal links in new tab", () => {
		render(
			<CTASection
				secondaryAction={{
					label: "Internal Link",
					href: "/about",
					external: false,
				}}
			/>,
		);

		const link = screen.getByRole("link", { name: /internal link/i });
		expect(link).not.toHaveAttribute("target");
	});

	it("should render without actions when undefined", () => {
		render(
			<CTASection
				title="Ready to Get Started?"
				description="Start building your next website"
				primaryAction={undefined}
				secondaryAction={undefined}
			/>,
		);

		expect(screen.getByText("Ready to Get Started?")).toBeInTheDocument();
		// No action buttons when undefined
		expect(
			screen.queryByRole("link", { name: /get started/i }),
		).not.toBeInTheDocument();
	});

	it("should apply custom className", () => {
		const { container } = render(<CTASection className="custom-class" />);

		const section = container.querySelector("section");
		expect(section?.className).toContain("custom-class");
	});
});
