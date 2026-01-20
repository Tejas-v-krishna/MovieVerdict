"use client";

import { toggleWatchlist } from "@/lib/actions/watchlist";
import { usePathname } from "@/navigation";
import { Heart } from "lucide-react";
import { useTransition, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ArticleWatchlistButtonProps {
    movieId: string;
    initialIsWatchlisted: boolean;
    className?: string;
}

export function CardWatchlistButton({ movieId, initialIsWatchlisted, className }: ArticleWatchlistButtonProps) {
    const [isWatchlisted, setIsWatchlisted] = useState(initialIsWatchlisted);
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent card click
        e.stopPropagation();

        // Optimistic update
        setIsWatchlisted((prev) => !prev);

        startTransition(async () => {
            const result = await toggleWatchlist(movieId, pathname);
            if (result.error) {
                // Revert on error
                setIsWatchlisted((prev) => !prev);
                console.error(result.error);
            }
        });
    };

    return (
        <Button
            variant="secondary"
            size="icon"
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                "h-8 w-8 rounded-full shadow-sm bg-background/80 backdrop-blur-sm hover:bg-background",
                isWatchlisted && "text-pink-500 hover:text-pink-600",
                className
            )}
            title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
        >
            <Heart
                className={cn(
                    "h-4 w-4 transition-all",
                    isWatchlisted ? "fill-current scale-110" : ""
                )}
            />
        </Button>
    );
}
