"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SearchForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [query, setQuery] = useState(searchParams.get("q") || "");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(`/search?q=${encodeURIComponent(query)}`);
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-lg">
            <input
                type="text"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies (e.g. Inception)..."
                className="flex-1 px-4 py-2 border border-input rounded-md"
            />
            <Button type="submit">Search</Button>
        </form>
    );
}
