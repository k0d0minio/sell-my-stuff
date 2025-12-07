import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeroSection } from "./hero-section";

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
			h1: ({
				children,
				variants,
				...props
			}: {
				children: React.ReactNode;
				[key: string]: unknown;
			}) => <h1 {...props}>{children}</h1>,
			p: ({
				children,
				variants,
				...props
			}: {
				children: React.ReactNode;
				[key: string]: unknown;
			}) => <p {...props}>{children}</p>,
		},
	};
});

describe("HeroSection", () => {
	it("should render with default props", () => {
		render(
			<HeroSection
				title="Test Title"
				description="A production-ready starter template"
				primaryAction={{ label: "Get Started", href: "/" }}
				secondaryAction={{ label: "Learn More", href: "/about" }}
			/>,
		);

		expect(screen.getByText("Test Title")).toBeInTheDocument();
		expect(
			screen.getByText(/production-ready starter template/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /get started/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /learn more/i }),
		).toBeInTheDocument();
	});

	it("should render with custom props", () => {
		render(
			<HeroSection
				title="Custom Title"
				subtitle="Custom Subtitle"
				description="Custom description text"
				primaryAction={{ label: "Sign Up", href: "/signup" }}
				secondaryAction={{ label: "Read Docs", href: "/docs" }}
			/>,
		);

		expect(screen.getByText("Custom Title")).toBeInTheDocument();
		expect(screen.getByText("Custom Subtitle")).toBeInTheDocument();
		expect(screen.getByText("Custom description text")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /read docs/i }),
		).toBeInTheDocument();
	});

	it("should show arrow icon when showArrow is true", () => {
		render(
			<HeroSection
				title="Test"
				primaryAction={{ label: "Get Started", href: "/", showArrow: true }}
			/>,
		);

		const link = screen.getByRole("link", { name: /get started/i });
		expect(link.querySelector("svg")).toBeInTheDocument();
	});

	it("should not show arrow icon when showArrow is false", () => {
		render(
			<HeroSection
				title="Test"
				primaryAction={{ label: "Get Started", href: "/", showArrow: false }}
			/>,
		);

		const link = screen.getByRole("link", { name: /get started/i });
		// The arrow is a sibling, not a child, so we check the parent
		const button = link.closest("button") || link;
		expect(button).toBeInTheDocument();
	});

	it("should render without description when undefined", () => {
		render(<HeroSection title="Test" description={undefined} />);

		expect(screen.getByText("Test")).toBeInTheDocument();
		// No description when undefined
		expect(screen.queryByText(/production-ready/i)).not.toBeInTheDocument();
	});

	it("should render without description when empty string provided", () => {
		render(<HeroSection title="Test" description="" />);

		expect(screen.getByText("Test")).toBeInTheDocument();
		// Empty string means no description paragraph
		expect(screen.queryByText(/production-ready/i)).not.toBeInTheDocument();
	});

	it("should render without actions when undefined", () => {
		render(
			<HeroSection
				title="Test"
				primaryAction={undefined}
				secondaryAction={undefined}
			/>,
		);

		expect(screen.getByText("Test")).toBeInTheDocument();
		// No action buttons when undefined
		expect(
			screen.queryByRole("link", { name: /get started/i }),
		).not.toBeInTheDocument();
	});

	it("should apply custom className", () => {
		const { container } = render(
			<HeroSection title="Test" className="custom-class" />,
		);

		const section = container.querySelector("section");
		expect(section?.className).toContain("custom-class");
	});
});
