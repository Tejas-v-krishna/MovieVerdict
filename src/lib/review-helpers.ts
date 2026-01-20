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
export function parseSpoilers(content: string): { hasSpoilers: boolean; spoilerBlocks: any[] | null } {
    const spoilerRegex = /\[SPOILER\]([\s\S]*?)\[\/SPOILER\]/g;
    const hasSpoilers = spoilerRegex.test(content);

    // Simple block parsing: text, spoiler, text...
    const blocks = [];
    let lastIndex = 0;
    let match;

    // Reset regex state
    spoilerRegex.lastIndex = 0;

    while ((match = spoilerRegex.exec(content)) !== null) {
        // Text before spoiler
        if (match.index > lastIndex) {
            blocks.push({ type: 'text', content: content.slice(lastIndex, match.index) });
        }

        // Spoiler content
        blocks.push({ type: 'spoiler', content: match[1] });

        lastIndex = spoilerRegex.lastIndex;
    }

    // Remaining text
    if (lastIndex < content.length) {
        blocks.push({ type: 'text', content: content.slice(lastIndex) });
    }

    return {
        hasSpoilers,
        spoilerBlocks: hasSpoilers ? blocks : null,
    };
}
