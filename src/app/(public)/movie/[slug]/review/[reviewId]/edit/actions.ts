"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { parseSpoilers } from "@/lib/review-helpers";
import { revalidatePath } from "next/cache";

export async function updateReviewAction(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }

    const reviewId = formData.get("reviewId") as string;
    const movieSlug = formData.get("movieSlug") as string;
    const content = formData.get("content") as string;
    const verdict = formData.get("verdict") as string;
    const noConflict = formData.get("noConflict") === "true";
    const conflictExplanation = formData.get("conflictExplanation") as string;

    // Get existing review
    const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!existingReview) {
        throw new Error("Review not found");
    }

    // Verify ownership
    if (existingReview.authorId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    // Parse spoilers
    const { hasSpoilers } = parseSpoilers(content);

    // Handle conflict disclosure
    let conflictDisclosure = null;
    if (!noConflict && conflictExplanation) {
        conflictDisclosure = conflictExplanation;
    }

    // Create edit history record
    await prisma.reviewEdit.create({
        data: {
            reviewId,
            editedById: session.user.id!,
            previousContent: existingReview.content,
            newContent: content,
        },
    });

    // Update review
    await prisma.review.update({
        where: { id: reviewId },
        data: {
            content,
            hasSpoilers,
            conflictDisclosure,
            ...(verdict && { suggestedVerdict: verdict }),
        },
    });

    revalidatePath(`/movie/${movieSlug}`);
    redirect(`/movie/${movieSlug}`);
}
