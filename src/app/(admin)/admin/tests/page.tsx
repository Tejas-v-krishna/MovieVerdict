import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminTestsPage() {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const tests = await prisma.test.findMany({
        include: {
            movie: { select: { title: true, year: true } },
            questions: { select: { id: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Test Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Create and manage movie knowledge tests
                        </p>
                    </div>
                    <Link href="/admin/tests/new">
                        <Button>Create New Test</Button>
                    </Link>
                </div>

                <div className="border border-border rounded-md">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left p-4">Movie</th>
                                <th className="text-left p-4">Questions</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                        No tests created yet. Create your first test!
                                    </td>
                                </tr>
                            ) : (
                                tests.map((test) => (
                                    <tr key={test.id} className="border-t border-border">
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium">{test.movie.title}</div>
                                                <div className="text-sm text-muted-foreground">{test.movie.year}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">{test.questions.length} questions</td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${test.status === "ACTIVE"
                                                        ? "bg-green-100 text-green-800"
                                                        : test.status === "DRAFT"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {test.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {new Date(test.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
