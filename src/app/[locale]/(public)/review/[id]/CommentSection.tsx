"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Need to ensure Textarea exists
import { addPublicComment } from "@/lib/actions/comment";
import { usePathname } from "@/navigation";
import { formatDate } from "@/lib/utils"; // Assume util exists or standard JS
import { Link } from "@/navigation";

interface CommentSectionProps {
    reviewId: string;
    initialComments: any[];
    currentUser: any;
}

export function CommentSection({ reviewId, initialComments, currentUser }: CommentSectionProps) {
    const [body, setBody] = useState("");
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    const handleSubmit = () => {
        if (!body.trim()) return;

        startTransition(async () => {
            await addPublicComment(reviewId, body, pathname);
            setBody("");
        });
    };

    return (
        <div className="space-y-8">
            {/* List */}
            <div className="space-y-6">
                {initialComments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                        <Link href={`/user/${comment.author.handle || comment.author.id}`}>
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={comment.author.reviewerProfile?.avatarUrl || comment.author.image} />
                                <AvatarFallback>{comment.author.name?.[0]}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <Link href={`/user/${comment.author.handle || comment.author.id}`} className="font-semibold hover:underline">
                                    {comment.author.name}
                                </Link>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.body}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            {currentUser ? (
                <div className="flex gap-4 pt-4 border-t">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUser.image} />
                        <AvatarFallback>{currentUser.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                        <Textarea
                            placeholder="Add a comment..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="min-h-[100px]"
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSubmit}
                                disabled={isPending || !body.trim()}
                            >
                                {isPending ? "Posting..." : "Post Comment"}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-muted rounded-lg text-center text-sm">
                    <Link href="/login" className="font-semibold hover:underline">Log in</Link> to join the discussion.
                </div>
            )}
        </div>
    );
}
