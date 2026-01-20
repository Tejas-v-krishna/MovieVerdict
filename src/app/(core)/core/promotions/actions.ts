"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function approveReviewAction(formData: FormData) {
    const session = await auth();

    if (!session?.user || (session.user.role !== "CORE_REVIEWER" && session.user.role !== "ADMIN")) {
        throw new Error("Unauthorized");
    }

    const reviewId = formData.get("reviewId") as string;

    // Update review to public
    await prisma.review.update({
        where: { id: reviewId },
        data: {
            visibility: "PUBLIC",
            status: "PUBLISHED",
        },
    });

    // Create promotion vote record
    await prisma.promotionVote.create({
        data: {
            reviewId,
            voterId: session.user.id!,
            vote: "APPROVE",
        },
    });

    revalidatePath("/core/promotions");
    redirect("/core/promotions");
}

export async function rejectReviewAction(formData: FormData) {
    const session = await auth();

    if (!session?.user || (session.user.role !== "CORE_REVIEWER" && session.user.role !== "ADMIN")) {
        throw new Error("Unauthorized");
    }

    const reviewId = formData.get("reviewId") as string;

    // Create rejection vote
    await prisma.promotionVote.create({
        data: {
            reviewId,
            voterId: session.user.id!,
            vote: "REJECT",
        },
    });

    // Mark review as rejected
    await prisma.review.update({
        where: { id: reviewId },
        data: {
            status: "REJECTED",
        },
    });

    revalidatePath("/core/promotions");
    redirect("/core/promotions");
}
