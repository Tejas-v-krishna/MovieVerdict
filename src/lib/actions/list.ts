"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
// import { slugify } from "@/lib/utils"; // Removed unused import

function makeSlug(title: string) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

export async function createList(title: string, description?: string, isPublic: boolean = true) {
    const session = await auth();
    if (!session) return { error: "Login required" };
    if (!title.trim()) return { error: "Title is required" };

    try {
        let slug = makeSlug(title);
        // Check for uniqueness
        let existing = await prisma.curatedList.findUnique({ where: { slug } });
        let counter = 1;
        while (existing) {
            slug = `${makeSlug(title)}-${counter}`;
            existing = await prisma.curatedList.findUnique({ where: { slug } });
            counter++;
        }

        const list = await prisma.curatedList.create({
            data: {
                title: title.trim(),
                description: description?.trim(),
                slug,
                isPublic,
                createdById: session.user.id!
            }
        });

        return { success: true, list };
    } catch (error) {
        console.error("Create List error:", error);
        return { error: "Failed to create list" };
    }
}

export async function addMovieToList(listId: string, movieId: string, note?: string) {
    const session = await auth();
    if (!session) return { error: "Login required" };

    const list = await prisma.curatedList.findUnique({ where: { id: listId } });
    if (!list) return { error: "List not found" };
    if (list.createdById !== session.user.id) return { error: "Unauthorized" };

    try {
        // Get max order
        const maxOrderAgg = await prisma.curatedListItem.aggregate({
            where: { listId },
            _max: { order: true }
        });
        const nextOrder = (maxOrderAgg._max.order ?? 0) + 1;

        await prisma.curatedListItem.create({
            data: {
                listId,
                movieId,
                note,
                order: nextOrder
            }
        });

        revalidatePath(`/list/${list.slug}`);
        return { success: true };
    } catch (error) {
        // handle constraint violation if already added?
        return { error: "Failed to add movie to list" };
    }
}

export async function getUserLists(userId: string) {
    return await prisma.curatedList.findMany({
        where: { createdById: userId },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { items: true } }
        }
    });
}

export async function getMyLists() {
    const session = await auth();
    if (!session) return [];
    return getUserLists(session.user.id!);
}

export async function removeMovieFromList(listId: string, movieId: string) {
    const session = await auth();
    if (!session) return { error: "Login required" };

    const list = await prisma.curatedList.findUnique({ where: { id: listId } });
    if (!list) return { error: "List not found" };
    if (list.createdById !== session.user.id) return { error: "Unauthorized" };

    await prisma.curatedListItem.deleteMany({
        where: {
            listId,
            movieId
        }
    });

    revalidatePath(`/list/${list.slug}`);
    return { success: true };
}
