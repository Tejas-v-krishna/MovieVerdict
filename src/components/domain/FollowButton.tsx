"use client";

import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/lib/actions/user";
import { usePathname } from "@/navigation";
import { UserPlus, UserCheck } from "lucide-react";
import { useTransition, useState } from "react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing: boolean;
}

export function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    const handleToggle = () => {
        // Optimistic update
        setIsFollowing((prev) => !prev);

        startTransition(async () => {
            const result = await toggleFollow(targetUserId, pathname);
            if (result.error) {
                // Revert on error
                setIsFollowing((prev) => !prev);
                console.error(result.error); // Add toast here later
            }
        });
    };

    return (
        <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                "gap-2 transition-all",
                isFollowing && "text-muted-foreground hover:text-destructive hover:border-destructive"
            )}
        >
            {isFollowing ? (
                <>
                    <UserCheck className="h-4 w-4" />
                    Following
                </>
            ) : (
                <>
                    <UserPlus className="h-4 w-4" />
                    Follow
                </>
            )}
        </Button>
    );
}
