"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function proposeVerdictAction(formData: FormData) {
    const session = await auth();

    if (!session || (session.user.role !== "CORE_REVIEWER" && session.user.role !== "ADMIN")) {
        throw new Error("Unauthorized");
    }

    const movieId = formData.get("movieId") as string;
    const newVerdict = formData.get("newVerdict") as string;
    const shortVerdict = formData.get("shortVerdict") as string;
    const reasoning = formData.get("reasoning") as string;

    // Create verdict history entry with PENDING status
    await prisma.verdictHistory.create({
        data: {
            movieId,
            fromVerdict: null, // Will be set on approval
            toVerdict: newVerdict as any,
            shortVerdict,
            reason: reasoning,
            requestedById: session.user.id!,
            status: "PENDING",
        },
    });

    revalidatePath("/core/verdict-proposals");
    redirect("/core/verdict-proposals?submitted=true");
}
