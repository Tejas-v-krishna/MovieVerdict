import prisma from "@/lib/db";

export const PASSING_SCORE_PERCENTAGE = 80;

/**
 * Get user's test status for a movie
 */
export async function getUserTestStatus(movieId: string, userId: string) {
    const activeTest = await prisma.test.findFirst({
        where: { movieId, status: "ACTIVE" },
    });

    if (!activeTest) {
        return { hasTest: false, hasPassed: false, canReview: false, testId: null };
    }

    const passedAttempt = await prisma.testAttempt.findFirst({
        where: {
            testId: activeTest.id,
            userId,
            passed: true,
        },
    });

    return {
        hasTest: true,
        hasPassed: !!passedAttempt,
        canReview: !!passedAttempt,
        testId: activeTest.id,
    };
}

/**
 * Check if user can review a movie (must have passed the test)
 */
export async function canUserReviewMovie(movieId: string, userId: string): Promise<boolean> {
    const status = await getUserTestStatus(movieId, userId);
    return status.canReview;
}

/**
 * Calculate test score and determine pass/fail
 */
export function gradeTestAnswers(
    questions: { correctIndex: number }[],
    userAnswers: number[]
): { score: number; total: number; percentage: number; passed: boolean } {
    const total = questions.length;
    const score = questions.reduce((acc, question, index) => {
        return acc + (question.correctIndex === userAnswers[index] ? 1 : 0);
    }, 0);

    const percentage = (score / total) * 100;
    const passed = percentage >= PASSING_SCORE_PERCENTAGE;

    return { score, total, percentage, passed };
}
