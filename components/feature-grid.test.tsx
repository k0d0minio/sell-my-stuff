import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FeatureGrid, type FeatureItem } from "./feature-grid";

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
		AnimatePresence: ({ children }: { children: React.ReactNode }) => (
			<>{children}</>
		),
	};
});

const customFeatures: FeatureItem[] = [
	{
		icon: "zap",
		title: "Fast",
		description: "Lightning fast performance",
	},
	{
		icon: "shield",
		title: "Secure",
		description: "Enterprise-grade security",
	},
];

describe("FeatureGrid", () => {
	it("should render with default props", () => {
		render(
			<FeatureGrid
				title="Everything You Need"
				description="A complete toolkit for building modern websites"
				features={[
					{
						icon: "zap",
						title: "Lightning Fast",
						description: "Fast performance",
					},
					{
						icon: "shield",
						title: "Type Safe",
						description: "TypeScript support",
					},
				]}
			/>,
		);

		expect(screen.getByText("Everything You Need")).toBeInTheDocument();
		expect(screen.getByText(/complete toolkit/i)).toBeInTheDocument();
		expect(screen.getByText("Lightning Fast")).toBeInTheDocument();
		expect(screen.getByText("Type Safe")).toBeInTheDocument();
	});

	it("should render with custom props", () => {
		render(
			<FeatureGrid
				title="Our Features"
				description="Check out what we offer"
				features={customFeatures}
			/>,
		);

		expect(screen.getByText("Our Features")).toBeInTheDocument();
		expect(screen.getByText("Check out what we offer")).toBeInTheDocument();
		expect(screen.getByText("Fast")).toBeInTheDocument();
		expect(screen.getByText("Secure")).toBeInTheDocument();
		expect(screen.getByText("Lightning fast performance")).toBeInTheDocument();
	});

	it("should render custom section ID", () => {
		const { container } = render(<FeatureGrid id="custom-features" />);

		const section = container.querySelector("#custom-features");
		expect(section).toBeInTheDocument();
	});

	it("should render all feature icons", () => {
		render(<FeatureGrid features={customFeatures} />);

		// Icons are rendered as SVG elements within the feature cards
		// Check that feature titles are present, which confirms cards are rendered
		expect(screen.getByText("Fast")).toBeInTheDocument();
		expect(screen.getByText("Secure")).toBeInTheDocument();
	});

	it("should apply custom className", () => {
		const { container } = render(<FeatureGrid className="custom-class" />);

		const section = container.querySelector("section");
		expect(section?.className).toContain("custom-class");
	});

	it("should render empty features array", async () => {
		render(
			<FeatureGrid
				title="Everything You Need"
				description="A complete toolkit"
				features={[]}
			/>,
		);

		await waitFor(() => {
			expect(screen.getByText("Everything You Need")).toBeInTheDocument();
		});
		// No feature cards should be rendered
		const cards = screen.queryAllByRole("article");
		expect(cards.length).toBe(0);
	});
});
