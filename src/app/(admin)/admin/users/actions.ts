"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function changeUserRoleAction(formData: FormData) {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const userId = formData.get("userId") as string;
    const newRole = formData.get("newRole") as string;

    // Don't allow changing own role
    if (userId === session.user.id) {
        throw new Error("Cannot change your own role");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
    });

    // Create audit log
    await prisma.auditLog.create({
        data: {
            action: "ROLE_CHANGE",
            actorId: session.user.id!,
            targetType: "USER",
            targetId: userId,
            metadata: { newRole },
        },
    });

    revalidatePath("/admin/users");
    redirect("/admin/users");
}

export async function banUserAction(formData: FormData) {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const userId = formData.get("userId") as string;
    const reason = formData.get("reason") as string;
    const duration = formData.get("duration") as string; // "7" or "30" or "permanent"

    let expiresAt = null;
    if (duration !== "permanent") {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(duration));
    }

    await prisma.ban.create({
        data: {
            userId,
            bannedById: session.user.id!,
            reason,
            expiresAt,
        },
    });

    // Create audit log
    await prisma.auditLog.create({
        data: {
            action: "BAN_USER",
            actorId: session.user.id!,
            targetType: "USER",
            targetId: userId,
            metadata: { reason, duration },
        },
    });

    revalidatePath("/admin/users");
    redirect("/admin/users");
}
