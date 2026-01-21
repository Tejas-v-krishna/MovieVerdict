"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface SearchFormProps {
    className?: string;
}

export function SearchForm({ className }: SearchFormProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [query, setQuery] = useState(searchParams.get("q") || "");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(`/search?q=${encodeURIComponent(query)}`);
    }

    return (
        <form onSubmit={handleSubmit} className={cn("flex gap-2 w-full max-w-lg", className)}>
            <input
                type="text"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies..."
                className="flex-1 px-4 py-2 border border-input rounded-md bg-transparent text-inherit placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" variant={className ? "secondary" : "default"}>Search</Button>
        </form>
    );
}
