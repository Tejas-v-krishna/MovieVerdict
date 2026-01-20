import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createTestAction } from "./actions";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";

export default async function NewTestPage() {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    // Get recent movies for dropdown
    const movies = await prisma.movie.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, title: true, year: true, slug: true },
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Create New Test</h1>
                    <p className="text-muted-foreground mt-1">
                        Create a factual knowledge test for a movie
                    </p>
                </div>

                <form action={createTestAction} className="space-y-8">
                    {/* Movie Selection */}
                    <div>
                        <label htmlFor="movieId" className="block text-sm font-medium mb-2">
                            Select Movie
                        </label>
                        <select
                            id="movieId"
                            name="movieId"
                            required
                            className="w-full px-3 py-2 border border-input rounded-md"
                        >
                            <option value="">-- Select a movie --</option>
                            {movies.map((movie) => (
                                <option key={movie.id} value={movie.id}>
                                    {movie.title} ({movie.year})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Questions</h2>
                            <p className="text-sm text-muted-foreground">Add 5-10 factual questions</p>
                        </div>

                        {/* Question 1 */}
                        <div className="p-6 border border-border rounded-md space-y-4">
                            <h3 className="font-medium">Question 1</h3>

                            <div>
                                <label className="block text-sm font-medium mb-1">Prompt</label>
                                <textarea
                                    name="q1_prompt"
                                    required
                                    placeholder="What is the main character's profession?"
                                    className="w-full px-3 py-2 border border-input rounded-md"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Option A</label>
                                    <input
                                        type="text"
                                        name="q1_option_0"
                                        required
                                        className="w-full px-3 py-2 border border-input rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Option B</label>
                                    <input
                                        type="text"
                                        name="q1_option_1"
                                        required
                                        className="w-full px-3 py-2 border border-input rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Option C</label>
                                    <input
                                        type="text"
                                        name="q1_option_2"
                                        required
                                        className="w-full px-3 py-2 border border-input rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Option D</label>
                                    <input
                                        type="text"
                                        name="q1_option_3"
                                        required
                                        className="w-full px-3 py-2 border border-input rounded-md"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Correct Answer</label>
                                <select name="q1_correct" required className="w-full px-3 py-2 border border-input rounded-md">
                                    <option value="0">A</option>
                                    <option value="1">B</option>
                                    <option value="2">C</option>
                                    <option value="3">D</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Explanation (optional)</label>
                                <textarea
                                    name="q1_explanation"
                                    placeholder="Explain why this is the correct answer..."
                                    className="w-full px-3 py-2 border border-input rounded-md"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Question 2-5 (simplified - same structure) */}
                        {[2, 3, 4, 5].map((num) => (
                            <div key={num} className="p-6 border border-border rounded-md space-y-4">
                                <h3 className="font-medium">Question {num}</h3>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Prompt</label>
                                    <textarea
                                        name={`q${num}_prompt`}
                                        required
                                        className="w-full px-3 py-2 border border-input rounded-md"
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {[0, 1, 2, 3].map((optIdx) => (
                                        <div key={optIdx}>
                                            <label className="block text-sm font-medium mb-1">
                                                Option {String.fromCharCode(65 + optIdx)}
                                            </label>
                                            <input
                                                type="text"
                                                name={`q${num}_option_${optIdx}`}
                                                required
                                                className="w-full px-3 py-2 border border-input rounded-md"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Correct Answer</label>
                                    <select name={`q${num}_correct`} required className="w-full px-3 py-2 border border-input rounded-md">
                                        <option value="0">A</option>
                                        <option value="1">B</option>
                                        <option value="2">C</option>
                                        <option value="3">D</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Explanation (optional)</label>
                                    <textarea
                                        name={`q${num}_explanation`}
                                        className="w-full px-3 py-2 border border-input rounded-md"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" name="activate" value="false">
                            Save as Draft
                        </Button>
                        <Button type="submit" name="activate" value="true" variant="default">
                            Save & Activate
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
