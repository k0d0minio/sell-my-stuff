import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
	it("should merge class names correctly", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	it("should handle conditional classes", () => {
		expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
		expect(cn("foo", true && "bar", "baz")).toBe("foo bar baz");
	});

	it("should merge Tailwind classes with conflicts", () => {
		expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
	});

	it("should handle undefined and null values", () => {
		expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
	});

	it("should handle empty strings", () => {
		expect(cn("foo", "", "bar")).toBe("foo bar");
	});

	it("should handle arrays of classes", () => {
		expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
	});

	it("should handle objects with boolean values", () => {
		expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
	});

	it("should handle mixed inputs", () => {
		expect(
			cn(
				"base-class",
				{ conditional: true, hidden: false },
				["array-class"],
				"string-class",
			),
		).toBe("base-class conditional array-class string-class");
	});
});
