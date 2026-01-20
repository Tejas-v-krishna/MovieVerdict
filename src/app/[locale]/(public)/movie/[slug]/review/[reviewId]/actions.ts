"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addCommentSchema = z.object({
    body: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
});

export async function addReviewComment(reviewId: string, formData: FormData) {
    const session = await auth();
    if (!session) {
        return { error: "You must be logged in to comment." };
    }

    const result = addCommentSchema.safeParse({
        body: formData.get("body"),
    });

    if (!result.success) {
        return { error: result.error.issues[0].message };
    }

    const { body } = result.data;

    // Fetch review to check permissions
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
        include: { author: true },
    });

    if (!review) {
        return { error: "Review not found." };
    }

    // Permission Logic:
    // 1. Core Reviewers can comment on ANY review for mentorship.
    // 2. The Author can comment on THEIR OWN review (to reply).
    // 3. Admins can comment.
    // 4. Non-Core members cannot comment on OTHER people's reviews (yet).

    const isAuthor = review.authorId === session.user.id;
    const isCoreOrAdmin = session.user.role === "CORE_REVIEWER" || session.user.role === "ADMIN";

    if (!isAuthor && !isCoreOrAdmin) {
        return { error: "You do not have permission to comment on this review." };
    }

    // By default, comments are PRIVATE (Mentoring mode) unless specifically made public?
    // Use Case: Core Reviewer gives feedback on a Draft/Pending review.
    // Use Case: Core Reviewer discusses a Public review.
    // For now, let's keep it simple: matches review visibility? 
    // NO, Bible says "Discussions are always private".

    try {
        await prisma.reviewComment.create({
            data: {
                reviewId,
                authorId: session.user.id!,
                body,
                isPrivate: true, // Always private per Bible Rule #8
            },
        });

        revalidatePath(`/movie/[slug]/review/${reviewId}`); // We don't have slug here easily, but... path revalidation is tricky with dynamic segments if not passed.
        // Actually revalidatePath works on the actual visited path usually.
        return { success: true };
    } catch (error) {
        console.error("Failed to add comment:", error);
        return { error: "Something went wrong." };
    }
}
