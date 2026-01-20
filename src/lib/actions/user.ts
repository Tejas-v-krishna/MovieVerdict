"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleFollow(targetUserId: string, pathname: string) {
    const session = await auth();
    if (!session) return { error: "Login required" };
    if (session.user.id === targetUserId) return { error: "Cannot follow yourself" };

    const userId = session.user.id!;

    try {
        const existing = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetUserId
                }
            }
        });

        if (existing) {
            await prisma.follows.delete({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: targetUserId
                    }
                }
            });
        } else {
            await prisma.follows.create({
                data: {
                    followerId: userId,
                    followingId: targetUserId
                }
            });
        }

        revalidatePath(pathname);
        return { success: true, isFollowing: !existing };
    } catch (error) {
        console.error("Follow error:", error);
        return { error: "Failed to update follow status" };
    }
}
