"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTestAction(formData: FormData) {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const movieId = formData.get("movieId") as string;
    const shouldActivate = formData.get("activate") === "true";

    // Parse questions (fixed 5 questions for now)
    const questions = [];
    for (let i = 1; i <= 5; i++) {
        const prompt = formData.get(`q${i}_prompt`) as string;
        if (!prompt) continue;

        const options = [
            formData.get(`q${i}_option_0`) as string,
            formData.get(`q${i}_option_1`) as string,
            formData.get(`q${i}_option_2`) as string,
            formData.get(`q${i}_option_3`) as string,
        ];

        const correctIndex = parseInt(formData.get(`q${i}_correct`) as string);
        const explanation = formData.get(`q${i}_explanation`) as string;

        questions.push({
            prompt,
            options,
            correctIndex,
            explanation: explanation || null,
        });
    }

    if (questions.length === 0) {
        throw new Error("At least one question is required");
    }

    // If activating, deactivate any existing active tests for this movie
    if (shouldActivate) {
        await prisma.test.updateMany({
            where: { movieId, status: "ACTIVE" },
            data: { status: "ARCHIVED" },
        });
    }

    // Create test
    const test = await prisma.test.create({
        data: {
            movieId,
            version: 1,
            status: shouldActivate ? "ACTIVE" : "DRAFT",
            questions: {
                create: questions.map((q) => ({
                    type: "MCQ",
                    prompt: q.prompt,
                    options: q.options,
                    correctIndex: q.correctIndex,
                    explanation: q.explanation,
                })),
            },
        },
    });

    revalidatePath("/admin/tests");
    redirect("/admin/tests");
}
