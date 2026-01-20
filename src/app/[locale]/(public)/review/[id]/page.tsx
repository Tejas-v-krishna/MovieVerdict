import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { ReviewCard } from "@/components/domain/ReviewCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/navigation";
import { CommentSection } from "./CommentSection";

interface ReviewPageProps {
    params: { id: string };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
    const session = await auth();
    const { id } = params;

    const review = await prisma.review.findUnique({
        where: { id },
        include: {
            movie: true,
            author: {
                include: { reviewerProfile: true }
            },
            comments: {
                where: { isPrivate: false }, // Only public comments for now
                orderBy: { createdAt: 'asc' },
                include: {
                    author: {
                        include: { reviewerProfile: true }
                    }
                }
            }
        }
    });

    if (!review) notFound();
    if (review.visibility !== "PUBLIC" || review.status !== "PUBLISHED") {
        // Allow author and admins to see it still?
        if (session?.user?.id !== review.authorId && session?.user?.role !== "ADMIN") {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Private Review</h1>
                        <p className="text-muted-foreground">This review is not visible to the public.</p>
                        <Link href="/" className="text-primary hover:underline mt-4 inline-block">Go Home</Link>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Back Link */}
                <Link href={`/movie/${review.movie.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
                    ← Back to {review.movie.title}
                </Link>

                {/* The Review */}
                <ReviewCard
                    review={review}
                    movie={review.movie}
                    hideActions={true} // Hide the "Read Full Review" button since we are here
                    expanded={true}
                />

                {/* Comments Section */}
                <div className="bg-card border rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-6">Comments ({review.comments.length})</h2>

                    <CommentSection
                        reviewId={review.id}
                        initialComments={review.comments}
                        currentUser={session?.user}
                    />
                </div>
            </div>
        </div>
    );
}
