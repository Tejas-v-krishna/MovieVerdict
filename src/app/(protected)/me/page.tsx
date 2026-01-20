import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import prisma from "@/lib/db";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    async function handleSignOut() {
        "use server";
        await signOut();
    }

    // Get user's test attempts
    const testAttempts = await prisma.testAttempt.findMany({
        where: { userId: session.user.id!, passed: true },
        include: {
            test: {
                include: { movie: { select: { title: true, slug: true } } },
            },
        },
        orderBy: { completedAt: "desc" },
    });

    // Get user's reviews
    const userReviews = await prisma.review.findMany({
        where: { authorId: session.user.id! },
        include: {
            movie: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    // Get pending reviews count (for Core Reviewers)
    let pendingReviewsCount = 0;
    if (session.user.role === "CORE_REVIEWER" || session.user.role === "ADMIN") {
        pendingReviewsCount = await prisma.review.count({
            where: { visibility: "PRIVATE", status: "PENDING" },
        });
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Welcome, {session.user.name || session.user.handle}</h1>
                    <form action={handleSignOut}>
                        <Button type="submit" variant="outline">
                            Sign out
                        </Button>
                    </form>
                </div>

                <div className="p-6 border border-border rounded-lg space-y-4">
                    <h2 className="text-xl font-semibold">Your Profile</h2>

                    <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Email:</span> {session.user.email}</p>
                        <p><span className="font-medium">Handle:</span> {session.user.handle || "Not set"}</p>
                        <p><span className="font-medium">Role:</span> {session.user.role}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-6 border border-border rounded-lg text-center">
                        <p className="text-3xl font-bold">{testAttempts.length}</p>
                        <p className="text-sm text-muted-foreground">Tests Passed</p>
                    </div>
                    <div className="p-6 border border-border rounded-lg text-center">
                        <p className="text-3xl font-bold">{userReviews.length}</p>
                        <p className="text-sm text-muted-foreground">Reviews Written</p>
                    </div>
                    {(session.user.role === "CORE_REVIEWER" || session.user.role === "ADMIN") && (
                        <div className="p-6 border border-border rounded-lg text-center">
                            <p className="text-3xl font-bold">{pendingReviewsCount}</p>
                            <p className="text-sm text-muted-foreground">Pending Reviews</p>
                        </div>
                    )}
                </div>

                {/* Reviews */}
                {userReviews.length > 0 && (
                    <div className="p-6 border border-border rounded-lg space-y-4">
                        <h2 className="text-xl font-semibold">Your Reviews</h2>
                        <div className="space-y-2">
                            {userReviews.map((review) => (
                                <div key={review.id} className="flex justify-between items-center p-3 bg-muted rounded">
                                    <div>
                                        <p className="font-medium">{review.movie.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {review.visibility} • {review.status} •{' '}
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={`/movie/${review.movie.slug}`}>View</a>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Role-specific actions */}
                <div className="p-6 border border-border rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">What you can do</h2>

                    {session.user.role === "VIEWER" && (
                        <div className="text-sm text-muted-foreground space-y-2">
                            <p>As a VIEWER, you can:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Browse public reviews and movie verdicts</li>
                                <li>View curated lists</li>
                                <li>Pass movie knowledge tests to unlock reviewing</li>
                            </ul>
                            <p className="mt-4 font-medium">
                                💡 Pass your first test to become a NON_CORE_MEMBER!
                            </p>
                        </div>
                    )}

                    {session.user.role === "NON_CORE_MEMBER" && (
                        <div className="text-sm text-muted-foreground space-y-2">
                            <p>As a NON_CORE_MEMBER, you can:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Write private reviews (visible to Core Reviewers)</li>
                                <li>Take factual tests to unlock reviewing specific movies</li>
                                <li>Request 1:1 discussions with Core Reviewers</li>
                            </ul>
                        </div>
                    )}

                    {session.user.role === "CORE_REVIEWER" && (
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p>As a CORE_REVIEWER, you can:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Publish public reviews</li>
                                    <li>Create curated lists</li>
                                    <li>Review and promote non-core reviews</li>
                                    <li>Propose verdict changes</li>
                                </ul>
                            </div>
                            <Button asChild>
                                <a href="/core/promotions">Review Promotions Queue ({pendingReviewsCount})</a>
                            </Button>
                        </div>
                    )}

                    {session.user.role === "ADMIN" && (
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground space-y-2">
                                <p>As an ADMIN, you have full access:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Create and manage tests</li>
                                    <li>Approve verdict changes</li>
                                    <li>Moderate content</li>
                                    <li>Manage users and roles</li>
                                </ul>
                            </div>
                            <div className="flex gap-3">
                                <Button asChild>
                                    <a href="/admin/tests">Manage Tests</a>
                                </Button>
                                <Button asChild variant="outline">
                                    <a href="/core/promotions">Promotions ({pendingReviewsCount})</a>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
