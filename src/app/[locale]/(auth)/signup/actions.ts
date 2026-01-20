"use server";

import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export async function signupAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const handle = formData.get("handle") as string;

    // Validation
    if (!email || !password || !handle) {
        return { error: "All fields are required" };
    }

    if (password.length < 8) {
        return { error: "Password must be at least 8 characters" };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return { error: "User with this email already exists" };
    }

    // Check if handle is taken
    const existingHandle = await prisma.user.findUnique({
        where: { handle },
    });

    if (existingHandle) {
        return { error: "This handle is already taken" };
    }

    // Create user
    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            handle,
            name: handle, // Default name to handle
            role: "VIEWER",
        },
    });

    redirect("/login?signup=success");
}
