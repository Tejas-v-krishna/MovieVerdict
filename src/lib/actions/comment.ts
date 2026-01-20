"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addPublicComment(reviewId: string, body: string, pathname: string) {
    const session = await auth();
    if (!session) return { error: "Login required" };
    if (!body?.trim()) return { error: "Comment cannot be empty" };

    try {
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: { author: true, movie: true }
        });

        if (!review) return { error: "Review not found" };
        if (review.status !== "PUBLISHED" || review.visibility !== "PUBLIC") {
            return { error: "Cannot comment on this review" };
        }

        const comment = await prisma.reviewComment.create({
            data: {
                reviewId,
                authorId: session.user.id!,
                body: body.trim(),
                isPrivate: false // Public comment
            }
        });

        // Notify author if someone else commented
        if (review.authorId !== session.user.id) {
            await prisma.notification.create({
                data: {
                    userId: review.authorId,
                    type: "COMMENT_ON_REVIEW",
                    title: "New Comment",
                    message: `${session.user.name ?? "Someone"} commented on your review of ${review.movie.title}`,
                    link: `/review/${review.id}` // We need to create this page!
                }
            });
        }

        revalidatePath(pathname);
        return { success: true, comment };
    } catch (error) {
        console.error("Comment error:", error);
        return { error: "Failed to add comment" };
    }
}
