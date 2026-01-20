import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { submitTestAction } from "./actions";

interface TestPageProps {
    params: { slug: string };
}

export default async function TestPage({ params }: TestPageProps) {
    const session = await auth();
    if (!session) {
        redirect("/login");
    }

    // Get movie
    const movie = await prisma.movie.findUnique({
        where: { slug: params.slug },
    });

    if (!movie) {
        notFound();
    }

    // Get active test
    const test = await prisma.test.findFirst({
        where: { movieId: movie.id, status: "ACTIVE" },
        include: { questions: true },
    });

    if (!test) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-3xl mx-auto text-center py-12">
                    <h1 className="text-2xl font-bold mb-4">No Test Available</h1>
                    <p className="text-muted-foreground">
                        A knowledge test for this movie hasn&apos;t been created yet.
                    </p>
                </div>
            </div>
        );
    }

    // Check if already passed
    const existingAttempt = await prisma.testAttempt.findFirst({
        where: {
            testId: test.id,
            userId: session.user.id!,
            passed: true,
        },
    });

    if (existingAttempt) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-3xl mx-auto text-center py-12 space-y-4">
                    <h1 className="text-2xl font-bold">You&#39;ve Already Passed!</h1>
                    <p className="text-muted-foreground">
                        You passed this test on {new Date(existingAttempt.completedAt!).toLocaleDateString()}.
                        You can now review {movie.title}.
                    </p>
                    <Button asChild>
                        <a href={`/movie/${movie.slug}`}>Back to Movie</a>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">{movie.title} ({movie.year})</h1>
                    <p className="text-muted-foreground mt-1">
                        Knowledge Test - {test.questions.length} Questions
                    </p>
                    <p className="text-sm mt-2">
                        You need to score at least 80% to pass and unlock reviewing.
                    </p>
                </div>

                <form action={submitTestAction} className="space-y-8">
                    <input type="hidden" name="testId" value={test.id} />
                    <input type="hidden" name="movieSlug" value={movie.slug} />

                    {test.questions.map((question, index) => (
                        <div key={question.id} className="p-6 border border-border rounded-md space-y-4">
                            <div className="flex gap-3">
                                <span className="font-bold text-muted-foreground">Q{index + 1}.</span>
                                <p className="flex-1 font-medium">{question.prompt}</p>
                            </div>

                            <div className="space-y-2 ml-8">
                                {question.options.map((option, optIndex) => (
                                    <label
                                        key={optIndex}
                                        className="flex items-center gap-3 p-3 border border-input rounded hover:bg-muted cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name={`answer_${index}`}
                                            value={optIndex}
                                            required
                                            className="w-4 h-4"
                                        />
                                        <span>
                                            <strong>{String.fromCharCode(65 + optIndex)}.</strong> {option}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-4">
                        <Button type="submit" size="lg">
                            Submit Test
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
