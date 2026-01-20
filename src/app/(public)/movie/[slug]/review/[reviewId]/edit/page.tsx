import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { updateReviewAction } from "./actions";

interface EditReviewPageProps {
    params: { slug: string; reviewId: string };
}

export default async function EditReviewPage({ params }: EditReviewPageProps) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const review = await prisma.review.findUnique({
        where: { id: params.reviewId },
        include: {
            movie: { select: { title: true, year: true, slug: true } },
        },
    });

    if (!review) {
        notFound();
    }

    // Only author can edit
    if (review.authorId !== session.user.id) {
        redirect(`/movie/${params.slug}`);
    }

    const isCoreReviewer = session.user.role === "CORE_REVIEWER" || session.user.role === "ADMIN";

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Edit Review</h1>
                    <p className="text-muted-foreground mt-1">
                        {review.movie.title} ({review.movie.year})
                    </p>
                </div>

                <form action={updateReviewAction} className="space-y-6">
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="movieSlug" value={review.movie.slug} />

                    {/* Verdict (Core Reviewers only) */}
                    {isCoreReviewer && (
                        <div className="p-6 bg-muted rounded-md space-y-4">
                            <h2 className="font-semibold">Verdict</h2>
                            <select
                                name="verdict"
                                defaultValue={review.suggestedVerdict || ""}
                                className="w-full px-3 py-2 border border-input rounded-md"
                            >
                                <option value="">-- No verdict --</option>
                                <option value="S_PLUS">S+ (Exceptional)</option>
                                <option value="S">S (Great)</option>
                                <option value="A">A (Good)</option>
                                <option value="B">B (Average)</option>
                                <option value="C">C (Below Average)</option>
                            </select>
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
                            defaultValue={review.content}
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
                                defaultChecked={!review.conflictDisclosure}
                                className="mt-1"
                            />
                            <span className="text-sm">
                                I confirm I have no conflict of interest with this movie.
                            </span>
                        </label>

                        <div className="space-y-2">
                            <label htmlFor="conflictExplanation" className="block text-sm font-medium">
                                If you have a conflict, explain here:
                            </label>
                            <textarea
                                id="conflictExplanation"
                                name="conflictExplanation"
                                rows={3}
                                defaultValue={review.conflictDisclosure || ""}
                                className="w-full px-3 py-2 border border-input rounded-md text-sm"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button type="submit" size="lg">
                            Save Changes
                        </Button>
                        <Button type="button" variant="outline" size="lg" asChild>
                            <a href={`/movie/${review.movie.slug}`}>Cancel</a>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
