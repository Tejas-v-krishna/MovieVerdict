import prisma from "@/lib/db";
import { canUserReviewMovie } from "@/lib/test-helpers";

/**
 * Check if user can create a review for a movie
 */
export async function canCreateReview(movieId: string, userId: string): Promise<{
    canReview: boolean;
    reason?: string;
}> {
    // Check if passed test
    const hasPassedTest = await canUserReviewMovie(movieId, userId);
    if (!hasPassedTest) {
        return { canReview: false, reason: "You must pass the factual test first" };
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
        where: { movieId, authorId: userId },
    });

    if (existingReview) {
        return { canReview: false, reason: "You have already reviewed this movie" };
    }

    return { canReview: true };
}

/**
 * Parse review content to extract spoilers
 */
export function parseSpoilers(content: string): { hasSpoilers: boolean } {
    const spoilerRegex = /\[SPOILER\](.*?)\[\/SPOILER\]/gs;
    return {
        hasSpoilers: spoilerRegex.test(content),
    };
}
