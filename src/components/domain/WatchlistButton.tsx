"use client";

import { Button } from "@/components/ui/button";
import { toggleWatchlist } from "@/lib/actions/watchlist";
import { usePathname } from "@/navigation";
import { Heart } from "lucide-react";
import { useTransition, useState } from "react";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
    movieId: string;
    initialIsWatchlisted: boolean;
}

export function WatchlistButton({ movieId, initialIsWatchlisted }: WatchlistButtonProps) {
    const [isWatchlisted, setIsWatchlisted] = useState(initialIsWatchlisted);
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    const handleToggle = () => {
        // Optimistic update
        setIsWatchlisted((prev) => !prev);

        startTransition(async () => {
            const result = await toggleWatchlist(movieId, pathname);
            if (result.error) {
                // Revert on error
                setIsWatchlisted((prev) => !prev);
                console.error(result.error); // Add toast here later
            }
        });
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                "rounded-full transition-colors",
                isWatchlisted && "bg-pink-50 border-pink-200 hover:bg-pink-100 dark:bg-pink-900/20 dark:border-pink-800"
            )}
            title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
        >
            <Heart
                className={cn(
                    "h-5 w-5 transition-all",
                    isWatchlisted ? "fill-pink-500 text-pink-500 scale-110" : "text-muted-foreground"
                )}
            />
        </Button>
    );
}
