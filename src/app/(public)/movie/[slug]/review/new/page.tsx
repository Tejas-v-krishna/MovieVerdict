import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { canCreateReview } from "@/lib/review-helpers";
import { createReviewAction } from "./actions";

interface NewReviewPageProps {
    params: { slug: string };
}

export default async function NewReviewPage({ params }: NewReviewPageProps) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Only NON_CORE_MEMBER and above can review
    if (session.user.role === "VIEWER") {
        redirect(`/movie/${params.slug}`);
    }

    // Get movie
    const movie = await prisma.movie.findUnique({
        where: { slug: params.slug },
    });

    if (!movie) {
        notFound();
    }

    // Check eligibility
    const eligibility = await canCreateReview(movie.id, session.user.id!);

    if (!eligibility.canReview) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-3xl mx-auto text-center py-12 space-y-4">
                    <h1 className="text-2xl font-bold">Cannot Create Review</h1>
                    <p className="text-muted-foreground">{eligibility.reason}</p>
                    <Button asChild>
                        <a href={`/movie/${params.slug}`}>Back to Movie</a>
                    </Button>
                </div>
            </div>
        );
    }

    const isCoreReviewer = session.user.role === "CORE_REVIEWER" || session.user.role === "ADMIN";

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Write Review</h1>
                    <p className="text-muted-foreground mt-1">
                        {movie.title} ({movie.year})
                    </p>
                    {!isCoreReviewer && (
                        <p className="text-sm text-muted-foreground mt-2">
                            This review will be private and visible only to Core Reviewers for promotion consideration.
                        </p>
                    )}
                </div>

                <form action={createReviewAction} className="space-y-6">
                    <input type="hidden" name="movieId" value={movie.id} />
                    <input type="hidden" name="movieSlug" value={movie.slug} />

                    {/* Verdict (Core Reviewers only) */}
                    {isCoreReviewer && (
                        <div className="p-6 bg-muted rounded-md space-y-4">
                            <h2 className="font-semibold">Verdict (Required)</h2>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    Select your verdict for this movie. Public reviews represent MovieVerdict&apos;s voice.
                                </p>
                                <select
                                    name="verdict"
                                    required
                                    className="w-full px-3 py-2 border border-input rounded-md"
                                >
                                    <option value="">-- Select verdict --</option>
                                    <option value="S_PLUS">S+ (Exceptional)</option>
                                    <option value="S">S (Great)</option>
                                    <option value="A">A (Good)</option>
                                    <option value="B">B (Average)</option>
                                    <option value="C">C (Below Average)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Review Content */}
                    <div className="space-y-2">
                        <label htmlFor="content" className="block font-medium">
                            Your Review
                        </label>
                        <p className="text-sm text-muted-foreground">
                            Use <code className="bg-muted px-1">[SPOILER]text[/SPOILER]</code> to hide spoilers.
                        </p>
                        <textarea
                            id="content"
                            name="content"
                            required
                            rows={15}
                            placeholder="Write your thoughtful review here..."
                            className="w-full px-3 py-2 border border-input rounded-md font-mono text-sm"
                        />
                    </div>

                    {/* Conflict Disclosure */}
                    <div className="p-6 border border-border rounded-md space-y-4">
                        <h2 className="font-semibold">Conflict of Interest Disclosure</h2>

                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                name="noConflict"
                                value="true"
                                className="mt-1"
                            />
                            <span className="text-sm">
                                I confirm I have no conflict of interest with this movie (financial, personal, or professional).
                            </span>
                        </label>

                        <div className="space-y-2">
                            <label htmlFor="conflictExplanation" className="block text-sm font-medium">
                                If you <strong>do</strong> have a conflict, explain here (optional):
                            </label>
                            <textarea
                                id="conflictExplanation"
                                name="conflictExplanation"
                                rows={3}
                                placeholder="e.g., I worked on this film as a consultant..."
                                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button type="submit" size="lg">
                            {isCoreReviewer ? "Publish Review" : "Submit Private Review"}
                        </Button>
                        <Button type="button" variant="outline" size="lg" asChild>
                            <a href={`/movie/${movie.slug}`}>Cancel</a>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
