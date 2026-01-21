"use server";

import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust import path if needed
import { redirect } from "next/navigation";

export async function checkOnboardingStatus() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return false; // Assume false if not auth, effectively logic handled by client
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { onboardingCompleted: true },
    });

    return user?.onboardingCompleted ?? false;
}

export async function saveOnboardingPreferences(data: any) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { error: "Not authenticated" };
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                preferences: data,
                // We don't mark completed until the end, or maybe strictly at the end?
                // The prompt says "Persist answers incrementally".
                // We'll update just preferences here.
            },
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to save preferences:", error);
        return { error: "Failed to save preferences" };
    }
}

export async function completeOnboarding() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { error: "Not authenticated" };
    }

    try {
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                onboardingCompleted: true,
            },
        });
    } catch (error) {
        console.error("Failed to complete onboarding:", error);
        return { error: "Failed to complete onboarding" };
    }

    redirect("/");
}
