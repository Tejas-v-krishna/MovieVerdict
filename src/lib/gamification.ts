import prisma from "@/lib/db";

export async function checkAndAwardBadges(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                reviewerProfile: true,
                _count: {
                    select: {
                        reviews: { where: { status: "PUBLISHED", visibility: "PUBLIC" } },
                        followedBy: true
                    }
                }
            }
        });

        if (!user || !user.reviewerProfile) return;

        const currentBadges = new Set(user.reviewerProfile.badges);
        const newBadges = new Set(currentBadges);

        // Logic
        if (user._count.reviews >= 1) newBadges.add("Critic");
        if (user._count.reviews >= 10) newBadges.add("Top Critic");

        if (user._count.followedBy >= 5) newBadges.add("Rising Star");
        if (user._count.followedBy >= 50) newBadges.add("Influencer");

        // Save if changed
        if (newBadges.size > currentBadges.size) {
            await prisma.reviewerProfile.update({
                where: { userId },
                data: {
                    badges: Array.from(newBadges)
                }
            });
            // potentially notify user about new badge here
        }
    } catch (error) {
        console.error("Badge award error:", error);
    }
}
