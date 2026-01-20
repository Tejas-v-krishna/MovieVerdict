"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { gradeTestAnswers } from "@/lib/test-helpers";

export async function submitTestAction(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }

    const testId = formData.get("testId") as string;
    const movieSlug = formData.get("movieSlug") as string;

    // Fetch test with questions
    const test = await prisma.test.findUnique({
        where: { id: testId },
        include: { questions: { orderBy: { id: "asc" } } },
    });

    if (!test) {
        throw new Error("Test not found");
    }

    // Parse user answers
    const userAnswers: number[] = [];
    for (let i = 0; i < test.questions.length; i++) {
        const answer = formData.get(`answer_${i}`);
        userAnswers.push(parseInt(answer as string));
    }

    // Grade test
    const results = gradeTestAnswers(test.questions, userAnswers);

    // Create test attempt
    await prisma.testAttempt.create({
        data: {
            testId,
            userId: session.user.id!,
            score: results.score,
            passed: results.passed,
            startedAt: new Date(),
            completedAt: new Date(),
        },
    });

    // If passed and user is VIEWER, upgrade to NON_CORE_MEMBER
    if (results.passed) {
        const user = await prisma.user.findUnique({ where: { id: session.user.id! } });
        if (user && user.role === "VIEWER") {
            await prisma.user.update({
                where: { id: session.user.id! },
                data: { role: "NON_CORE_MEMBER" },
            });
        }
    }

    // Store results in URL params and redirect
    const params = new URLSearchParams({
        score: results.score.toString(),
        total: results.total.toString(),
        percentage: results.percentage.toFixed(1),
        passed: results.passed.toString(),
        upgraded: (results.passed && session.user.role === "VIEWER").toString(),
    });

    redirect(`/movie/${movieSlug}/test/result?${params.toString()}`);
}
