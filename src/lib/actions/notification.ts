"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getUnreadNotifications() {
    const session = await auth();
    if (!session) return [];

    return await prisma.notification.findMany({
        where: {
            userId: session.user.id,
            read: false
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 10
    });
}

export async function markAsRead(notificationId: string) {
    const session = await auth();
    if (!session) return;

    await prisma.notification.update({
        where: {
            id: notificationId,
            userId: session.user.id // Security check
        },
        data: {
            read: true
        }
    });

    revalidatePath('/', 'layout'); // Update the bell icon everywhere
}

export async function markAllAsRead() {
    const session = await auth();
    if (!session) return;

    await prisma.notification.updateMany({
        where: {
            userId: session.user.id,
            read: false
        },
        data: {
            read: true
        }
    });

    revalidatePath('/', 'layout');
}
