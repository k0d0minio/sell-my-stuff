import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution.
 *
 * This is a wrapper around `clsx` and `tailwind-merge` that ensures Tailwind classes
 * are properly merged and conflicting classes are resolved (e.g., `p-4` and `p-2`).
 *
 * @param inputs - Class names or conditional class objects to merge
 * @returns A string of merged class names with conflicts resolved
 *
 * @example
 * ```tsx
 * cn("p-4", "text-red-500", { "bg-blue-500": isActive })
 * // Returns: "p-4 text-red-500 bg-blue-500" (if isActive is true)
 *
 * cn("p-4", "p-2") // Returns: "p-2" (conflict resolved)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
