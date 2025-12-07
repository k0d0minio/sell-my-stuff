"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function SearchFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [search, setSearch] = useState(searchParams.get("search") || "");
	const [category, setCategory] = useState<string>(
		searchParams.get("category") || "all",
	);

	useEffect(() => {
		setSearch(searchParams.get("search") || "");
		setCategory(searchParams.get("category") || "all");
	}, [searchParams]);

	function handleSearch() {
		const params = new URLSearchParams();
		if (search.trim()) {
			params.set("search", search.trim());
		}
		if (category !== "all") {
			params.set("category", category);
		}
		const queryString = params.toString();
		router.push(`/${queryString ? `?${queryString}` : ""}`);
	}

	function handleCategoryChange(value: string) {
		setCategory(value);
		const params = new URLSearchParams(searchParams.toString());
		if (value === "all") {
			params.delete("category");
		} else {
			params.set("category", value);
		}
		if (search.trim()) {
			params.set("search", search.trim());
		}
		const queryString = params.toString();
		router.push(`/${queryString ? `?${queryString}` : ""}`);
	}

	function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			handleSearch();
		}
	}

	return (
		<div className="bg-white p-4 rounded-lg border shadow-sm">
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex-1">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							type="text"
							placeholder="Search items..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onKeyPress={handleKeyPress}
							className="pl-10"
						/>
					</div>
				</div>
				<div className="w-full sm:w-48">
					<Select value={category} onValueChange={handleCategoryChange}>
						<SelectTrigger>
							<SelectValue placeholder="All Categories" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							<SelectItem value="clothes">Clothes</SelectItem>
							<SelectItem value="decorations">Decorations</SelectItem>
							<SelectItem value="furniture">Furniture</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<Button onClick={handleSearch} className="w-full sm:w-auto">
					Search
				</Button>
			</div>
		</div>
	);
}

