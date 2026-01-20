"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleWatchlist(movieId: string, pathname: string) {
    const session = await auth();
    if (!session) {
        return { error: "Login required" };
    }

    try {
        const userId = session.user.id!;

        const existing = await prisma.watchlist.findUnique({
            where: {
                userId_movieId: { userId, movieId }
            }
        });

        if (existing) {
            await prisma.watchlist.delete({
                where: {
                    userId_movieId: { userId, movieId }
                }
            });
        } else {
            await prisma.watchlist.create({
                data: {
                    userId,
                    movieId
                }
            });
        }

        revalidatePath(pathname);
        return { success: true, isWatchlisted: !existing };
    } catch (error) {
        console.error("Watchlist error:", error);
        return { error: "Failed to update watchlist" };
    }
}
