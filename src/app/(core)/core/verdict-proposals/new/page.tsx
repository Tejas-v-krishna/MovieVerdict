import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { proposeVerdictAction } from "./actions";

interface NewVerdictProposalPageProps {
    searchParams: { movieId?: string };
}

export default async function NewVerdictProposalPage({ searchParams }: NewVerdictProposalPageProps) {
    const session = await auth();

    if (!session || (session.user.role !== "CORE_REVIEWER" && session.user.role !== "ADMIN")) {
        redirect("/");
    }

    let movie = null;
    if (searchParams.movieId) {
        movie = await prisma.movie.findUnique({
            where: { id: searchParams.movieId },
        });
    }

    // Get recent movies for dropdown if no movieId provided
    const movies = await prisma.movie.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, title: true, year: true, currentVerdict: true },
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Propose Verdict Change</h1>
                    <p className="text-muted-foreground mt-1">
                        Suggest a new verdict for a movie with reasoning
                    </p>
                </div>

                <form action={proposeVerdictAction} className="space-y-6">
                    {/* Movie Selection */}
                    <div>
                        <label htmlFor="movieId" className="block font-medium mb-2">
                            Select Movie
                        </label>
                        <select
                            id="movieId"
                            name="movieId"
                            required
                            defaultValue={movie?.id || ""}
                            className="w-full px-3 py-2 border border-input rounded-md"
                        >
                            <option value="">-- Select a movie --</option>
                            {movies.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.title} ({m.year}) - Current: {m.currentVerdict?.replace('_', '+') || 'None'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* New Verdict */}
                    <div>
                        <label htmlFor="newVerdict" className="block font-medium mb-2">
                            Proposed Verdict
                        </label>
                        <select
                            id="newVerdict"
                            name="newVerdict"
                            required
                            className="w-full px-3 py-2 border border-input rounded-md"
                        >
                            <option value="">-- Select verdict --</option>
                            <option value="S_PLUS">S+ (Exceptional - Must Watch)</option>
                            <option value="S">S (Great - Highly Recommended)</option>
                            <option value="A">A (Good - Worth Watching)</option>
                            <option value="B">B (Average - Conditional)</option>
                            <option value="C">C (Below Average - Skip)</option>
                        </select>
                    </div>

                    {/* Short Verdict */}
                    <div>
                        <label htmlFor="shortVerdict" className="block font-medium mb-2">
                            Short Verdict (1 sentence summary)
                        </label>
                        <textarea
                            id="shortVerdict"
                            name="shortVerdict"
                            required
                            maxLength={200}
                            rows={2}
                            placeholder="A tightly written thriller worth watching for its performances."
                            className="w-full px-3 py-2 border border-input rounded-md"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Max 200 characters</p>
                    </div>

                    {/* Reasoning */}
                    <div>
                        <label htmlFor="reasoning" className="block font-medium mb-2">
                            Reasoning for Change
                        </label>
                        <textarea
                            id="reasoning"
                            name="reasoning"
                            required
                            rows={6}
                            placeholder="Explain why this verdict is appropriate and what factors led to this assessment..."
                            className="w-full px-3 py-2 border border-input rounded-md"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button type="submit" size="lg">
                            Submit Proposal
                        </Button>
                        <Button type="button" variant="outline" size="lg" asChild>
                            <a href="/core/verdict-proposals">Cancel</a>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
