"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "@/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

const VERDICTS = ['S_PLUS', 'S', 'S_MINUS', 'A_PLUS', 'A', 'A_MINUS', 'B_PLUS', 'B', 'B_MINUS', 'C_PLUS', 'C', 'C_MINUS'];
const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'];

interface FilterSidebarProps {
    currentVerdict: string[];
    currentGenre: string[];
    currentYear?: string;
}

export function FilterSidebar({ currentVerdict, currentGenre }: FilterSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());

            // Handle array-like toggle
            if (name === "verdict") {
                const updated = currentVerdict.includes(value)
                    ? currentVerdict.filter(v => v !== value)
                    : [...currentVerdict, value];

                if (updated.length > 0) params.set("verdict", updated.join(','));
                else params.delete("verdict");
            } else if (name === "genre") {
                const updated = currentGenre.includes(value)
                    ? currentGenre.filter(g => g !== value)
                    : [...currentGenre, value];

                if (updated.length > 0) params.set("genre", updated.join(','));
                else params.delete("genre");
            } else {
                params.set(name, value);
            }

            return params.toString();
        },
        [searchParams, currentVerdict, currentGenre]
    );

    const toggleFilter = (key: string, value: string) => {
        router.push(pathname + '?' + createQueryString(key, value));
    };

    return (
        <div className="space-y-8 bg-card p-6 rounded-lg border border-border">
            {/* Verdicts */}
            <div>
                <h3 className="font-semibold mb-3">Verdict</h3>
                <div className="flex flex-wrap gap-2">
                    {VERDICTS.map(v => (
                        <button
                            key={v}
                            onClick={() => toggleFilter('verdict', v)}
                            className={cn(
                                "text-xs px-2 py-1 rounded border transition-colors",
                                currentVerdict.includes(v)
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            {v.replace('_', '+').replace('MINUS', '-')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Genres */}
            <div>
                <h3 className="font-semibold mb-3">Genre</h3>
                <div className="flex flex-wrap gap-2">
                    {GENRES.map(g => (
                        <button
                            key={g}
                            onClick={() => toggleFilter('genre', g)}
                            className={cn(
                                "text-xs px-2 py-1 rounded border transition-colors",
                                currentGenre.includes(g)
                                    ? "bg-secondary text-secondary-foreground border-secondary"
                                    : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clear Filters */}
            {(currentVerdict.length > 0 || currentGenre.length > 0) && (
                <Button
                    variant="ghost"
                    className="w-full text-sm text-muted-foreground hover:text-destructive"
                    onClick={() => router.push(pathname)}
                >
                    Clear All Filters
                </Button>
            )}
        </div>
    );
}
