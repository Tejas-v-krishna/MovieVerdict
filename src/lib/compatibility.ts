import { Verdict } from "@prisma/client";

const VERDICT_VALUES: Record<Verdict, number> = {
    "S_PLUS": 5,
    "S": 4,
    "A": 3,
    "B": 2,
    "C": 1
};

export function calculateCompatibilityScore(
    userReviews: { movieId: string; verdictLabel: Verdict }[],
    targetReviews: { movieId: string; verdictLabel: Verdict }[]
): number | null {
    if (userReviews.length === 0 || targetReviews.length === 0) return null;

    let totalScore = 0;
    let matchCount = 0;

    // Create a map for faster lookup
    const userMap = new Map(userReviews.map(r => [r.movieId, r.verdictLabel]));

    for (const targetReview of targetReviews) {
        if (userMap.has(targetReview.movieId)) {
            const userVerdict = userMap.get(targetReview.movieId)!;
            const targetVerdict = targetReview.verdictLabel;

            const v1 = VERDICT_VALUES[userVerdict];
            const v2 = VERDICT_VALUES[targetVerdict];

            const diff = Math.abs(v1 - v2);
            // Max diff is 4 (5-1). 
            // Normalize: 1.0 is perfect match.
            const score = Math.max(0, (4 - diff) / 4);

            totalScore += score;
            matchCount++;
        }
    }

    if (matchCount === 0) return null;

    return Math.round((totalScore / matchCount) * 100);
}
