import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";

interface ResultPageProps {
    params: { slug: string };
    searchParams: {
        score?: string;
        total?: string;
        percentage?: string;
        passed?: string;
        upgraded?: string;
    };
}

export default async function TestResultPage({ params, searchParams }: ResultPageProps) {
    const session = await auth();
    if (!session) {
        redirect("/login");
    }

    const { score, total, percentage, passed, upgraded } = searchParams;

    if (!score || !total) {
        redirect(`/movie/${params.slug}`);
    }

    const isPassed = passed === "true";
    const wasUpgraded = upgraded === "true";

    // Get movie for display
    const movie = await prisma.movie.findUnique({
        where: { slug: params.slug },
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Result Header */}
                <div className="text-center space-y-4">
                    <div className={`text-6xl ${isPassed ? "text-green-600" : "text-red-600"}`}>
                        {isPassed ? "✅" : "❌"}
                    </div>

                    <h1 className="text-4xl font-bold">
                        {isPassed ? "Congratulations!" : "Not Quite"}
                    </h1>

                    <div className="text-3xl font-bold">
                        {score}/{total} ({percentage}%)
                    </div>

                    <p className="text-xl text-muted-foreground">
                        {isPassed
                            ? "You passed the test!"
                            : "You need 80% to pass. Try again after reviewing the movie."}
                    </p>
                </div>

                {/* Upgrades */}
                {wasUpgraded && (
                    <div className="p-6 bg-primary/10 border border-primary rounded-md space-y-2">
                        <h2 className="text-xl font-semibold">🎉 Role Upgraded!</h2>
                        <p>
                            You&#39;ve been promoted to <strong>NON_CORE_MEMBER</strong>.
                            You can now write private reviews visible to Core Reviewers.
                        </p>
                    </div>
                )}

                {isPassed && (
                    <div className="p-6 bg-green-50 border border-green-200 rounded-md space-y-2">
                        <h2 className="text-xl font-semibold">Review Access Unlocked</h2>
                        <p>
                            You can now write a review for <strong>{movie?.title}</strong>.
                            {session.user.role === "CORE_REVIEWER" || session.user.role === "NON_CORE_MEMBER"
                                ? " Go to the movie page to start writing."
                                : ""}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <Button asChild size="lg">
                        <a href={`/movie/${params.slug}`}>Back to Movie</a>
                    </Button>
                    {!isPassed && (
                        <Button variant="outline" size="lg" asChild>
                            <a href={`/movie/${params.slug}/test`}>Try Again</a>
                        </Button>
                    )}
                </div>

                {/* Note about detailed results */}
                <div className="text-center text-sm text-muted-foreground">
                    <p>💡 Detailed question-by-question results coming soon</p>
                </div>
            </div>
        </div>
    );
}
