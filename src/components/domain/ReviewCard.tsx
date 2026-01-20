import { Link } from "@/navigation";
import type { Review, User, Movie } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewCardProps {
    review: Review & {
        author: Pick<User, "id" | "name" | "handle">;
    };
    movie?: Movie;
    hideActions?: boolean;
    expanded?: boolean;
}

export function ReviewCard({ review, movie, hideActions = false, expanded = false }: ReviewCardProps) {
    return (
        <div className="p-6 border border-border rounded-md space-y-4">
            {/* Header with Movie Title if expanded or in list context */}
            {(expanded || movie) && (
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        {movie && !expanded && (
                            <Link href={`/movie/${movie.slug}`} className="font-bold hover:underline mb-1 block">
                                {movie.title} ({movie.year})
                            </Link>
                        )}
                        <Link href={`/user/${review.author.handle || review.author.id}`} className="flex items-center gap-2 group">
                            <span className="font-medium group-hover:underline">
                                {review.author.name || review.author.handle}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                @{review.author.handle}
                            </span>
                        </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                </div>
            )}

            {/* ... Content ... */}

            {/* Conflict Disclosure */}
            {review.conflictDisclosure && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="font-medium text-yellow-900">⚠️ Conflict Disclosure:</p>
                    <p className="text-yellow-800 mt-1">{review.conflictDisclosure}</p>
                </div>
            )}

            {/* Review Content */}
            <div className="prose max-w-none text-foreground">
                {review.spoilerBlocks ? (
                    <SpoilerText content={review.body} />
                ) : (
                    <p className="whitespace-pre-wrap">{review.body}</p>
                )}
            </div>

            {/* Verdict */}
            {review.verdictLabel && (
                <div className="text-sm text-muted-foreground mt-2">
                    Verdict: <span className="font-bold text-foreground">{review.verdictLabel.replace('_', '+')}</span>
                </div>
            )}

            {/* Footer Actions */}
            {!hideActions && (
                <div className="border-t border-border pt-4 flex gap-4">
                    <Link href={`/review/${review.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Discuss
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
