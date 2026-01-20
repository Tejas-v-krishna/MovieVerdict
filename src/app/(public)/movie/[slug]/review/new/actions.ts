"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canCreateReview, parseSpoilers } from "@/lib/review-helpers";
import { revalidatePath } from "next/cache";

export async function createReviewAction(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }

    const movieId = formData.get("movieId") as string;
    const movieSlug = formData.get("movieSlug") as string;
    const content = formData.get("content") as string;
    const verdict = formData.get("verdict") as string;
    const noConflict = formData.get("noConflict") === "true";
    const conflictExplanation = formData.get("conflictExplanation") as string;

    // Verify eligibility
    const eligibility = await canCreateReview(movieId, session.user.id!);
    if (!eligibility.canReview) {
        throw new Error(eligibility.reason);
    }

    // Determine review properties based on role
    const isCoreReviewer = session.user.role === "CORE_REVIEWER" || session.user.role === "ADMIN";

    const visibility = isCoreReviewer ? "PUBLIC" : "PRIVATE";
    const status = isCoreReviewer ? "PUBLISHED" : "DRAFT";

    // Parse spoilers
    const { hasSpoilers } = parseSpoilers(content);

    // Handle conflict disclosure
    let conflictDisclosure = null;
    if (!noConflict && conflictExplanation) {
        conflictDisclosure = conflictExplanation;
    }

    // Create review
    await prisma.review.create({
        data: {
            movieId,
            authorId: session.user.id!,
            content,
            visibility,
            status,
            hasSpoilers,
            conflictDisclosure,
            // Store verdict if provided (CORE_REVIEWER only)
            ...(isCoreReviewer && verdict && { suggestedVerdict: verdict }),
        },
    });

    revalidatePath(`/movie/${movieSlug}`);
    redirect(`/movie/${movieSlug}?review=created`);
}
