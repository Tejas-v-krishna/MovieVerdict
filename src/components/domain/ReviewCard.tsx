import { SpoilerText } from "./SpoilerText";
import type { Review, User } from "@prisma/client";

interface ReviewCardProps {
    review: Review & {
        author: Pick<User, "name" | "handle">;
    };
}

export function ReviewCard({ review }: ReviewCardProps) {
    return (
        <div className="p-6 border border-border rounded-md space-y-4">
            {/* Author */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-medium">
                        {review.author.name || review.author.handle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        @{review.author.handle}
                    </p>
                </div>
                <p className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                </p>
            </div>

            {/* Conflict Disclosure */}
            {review.conflictDisclosure && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="font-medium text-yellow-900">⚠️ Conflict Disclosure:</p>
                    <p className="text-yellow-800 mt-1">{review.conflictDisclosure}</p>
                </div>
            )}

            {/* Review Content */}
            <div className="prose max-w-none">
                {review.spoilerBlocks ? (
                    <SpoilerText content={review.body} />
                ) : (
                    <p className="whitespace-pre-wrap">{review.body}</p>
                )}
            </div>

            {/* Suggested Verdict (if any) */}
            {review.suggestedVerdict && (
                <div className="text-sm text-muted-foreground">
                    Suggested Verdict: <strong>{review.suggestedVerdict.replace('_', '+')}</strong>
                </div>
            )}
        </div>
    );
}
