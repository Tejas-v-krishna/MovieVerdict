"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function approveVerdictAction(formData: FormData) {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const proposalId = formData.get("proposalId") as string;

    // Get proposal
    const proposal = await prisma.verdictHistory.findUnique({
        where: { id: proposalId },
        include: { movie: true },
    });

    if (!proposal) {
        throw new Error("Proposal not found");
    }

    // Update movie verdict
    await prisma.movie.update({
        where: { id: proposal.movieId },
        data: {
            currentVerdict: proposal.toVerdict,
            currentShortVerdict: proposal.shortVerdict,
        },
    });

    // Update proposal status
    await prisma.verdictHistory.update({
        where: { id: proposalId },
        data: {
            status: "APPROVED",
            approvedById: session.user.id!,
            approvedAt: new Date(),
            fromVerdict: proposal.movie.currentVerdict,
        },
    });

    revalidatePath("/admin/verdict-proposals");
    revalidatePath(`/movie/${proposal.movie.slug}`);
    redirect("/admin/verdict-proposals");
}

export async function rejectVerdictAction(formData: FormData) {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const proposalId = formData.get("proposalId") as string;

    await prisma.verdictHistory.update({
        where: { id: proposalId },
        data: {
            status: "REJECTED",
        },
    });

    revalidatePath("/admin/verdict-proposals");
    redirect("/admin/verdict-proposals");
}
