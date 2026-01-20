import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { ReviewCard } from "@/components/domain/ReviewCard";
import { CommentForm } from "./CommentForm";

interface ReviewDetailPageProps {
    params: {
        slug: string;
        reviewId: string;
        locale: string;
    };
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
    const { reviewId, locale } = params; // slug not strictly needed for DB but used for URL
    const session = await auth();

    if (!session) {
        redirect(`/${locale}/login`); // Force login for deep review access
    }

    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: {
            author: { select: { name: true, handle: true, image: true, id: true } }, // Need ID for permission check
            comments: {
                include: { author: { select: { name: true, handle: true, image: true } } },
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!review) {
        notFound();
    }

    // Permission Check:
    // 1. If Review is PUBLIC, anyone can view the REVIEW.
    // 2. If Review is PRIVATE, only Author and Core/Admin can view.
    // 3. COMMENTS are ALWAYS PRIVATE (Mentoring), so only Author and Core/Admin can see comments.

    const isAuthor = review.authorId === session.user.id;
    const isCoreOrAdmin = session.user.role === "CORE_REVIEWER" || session.user.role === "ADMIN";
    const canViewReview = review.visibility === "PUBLIC" || isAuthor || isCoreOrAdmin;

    if (!canViewReview) {
        return (
            <div className="container py-10 text-center">
                <h1 className="text-2xl font-bold">Private Review</h1>
                <p className="text-muted-foreground mt-2">You do not have permission to view this review.</p>
            </div>
        );
    }

    const canViewComments = isAuthor || isCoreOrAdmin;

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
            {/* Breadcrumb / Back Link */}
            <div>
                <a href={`/${locale}/movie/${params.slug}`} className="text-sm text-muted-foreground hover:underline">
                    ← Back to Movie
                </a>
            </div>

            {/* The Review Itself */}
            <ReviewCard review={review} />

            {/* Discussion Section (Private) */}
            {canViewComments ? (
                <div className="border-t border-border pt-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Mentorship Discussion (Private)</h2>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Visible only to You & Core Team
                        </span>
                    </div>

                    <div className="space-y-6">
                        {review.comments.length === 0 ? (
                            <p className="text-muted-foreground italic text-sm">No comments yet.</p>
                        ) : (
                            review.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-sm">
                                                {comment.author.name || comment.author.handle}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm">{comment.body}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Comment Form */}
                    <div className="pt-4">
                        <CommentForm reviewId={review.id} />
                    </div>
                </div>
            ) : (
                <div className="border-t border-border pt-8">
                    <p className="text-sm text-muted-foreground italic">
                        Discussion for this review is restricted to the author and core reviewers.
                    </p>
                </div>
            )}
        </div>
    );
}
