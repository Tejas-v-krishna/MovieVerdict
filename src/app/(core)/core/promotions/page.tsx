import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { approveReviewAction, rejectReviewAction } from "./actions";

export default async function PromotionsPage() {
    const session = await auth();

    if (!session || (session.user.role !== "CORE_REVIEWER" && session.user.role !== "ADMIN")) {
        redirect("/");
    }

    // Get all private reviews (pending promotion)
    const pendingReviews = await prisma.review.findMany({
        where: {
            visibility: "PRIVATE",
            status: "PENDING",
        },
        include: {
            author: { select: { name: true, handle: true } },
            movie: { select: { title: true, year: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Review Promotions Queue</h1>
                    <p className="text-muted-foreground mt-1">
                        Review and promote private reviews from non-core members
                    </p>
                </div>

                {pendingReviews.length === 0 ? (
                    <div className="p-12 text-center border border-border rounded-md">
                        <p className="text-muted-foreground">
                            No pending reviews. All caught up!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pendingReviews.map((review) => (
                            <div key={review.id} className="p-6 border border-border rounded-md space-y-4">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {review.movie.title} ({review.movie.year})
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            by @{review.author.handle} • {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <a
                                        href={`/movie/${review.movie.slug}`}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        View Movie
                                    </a>
                                </div>

                                {/* Conflict Disclosure */}
                                {review.conflictDisclosure && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                        <p className="font-medium text-yellow-900">⚠️ Conflict:</p>
                                        <p className="text-yellow-800">{review.conflictDisclosure}</p>
                                    </div>
                                )}

                                {/* Review Content */}
                                <div className="p-4 bg-muted rounded">
                                    <p className="whitespace-pre-wrap text-sm">{review.body}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <form action={approveReviewAction}>
                                        <input type="hidden" name="reviewId" value={review.id} />
                                        <Button type="submit" size="sm">
                                            Approve & Publish
                                        </Button>
                                    </form>

                                    <form action={rejectReviewAction}>
                                        <input type="hidden" name="reviewId" value={review.id} />
                                        <Button type="submit" variant="destructive" size="sm">
                                            Reject
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
