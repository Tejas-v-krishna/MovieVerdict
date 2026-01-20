import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function VerdictProposalsPage() {
    const session = await auth();

    if (!session || (session.user.role !== "CORE_REVIEWER" && session.user.role !== "ADMIN")) {
        redirect("/");
    }

    const proposals = await prisma.verdictHistory.findMany({
        where: { requestedById: session.user.id! },
        include: {
            movie: { select: { title: true, year: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">My Verdict Proposals</h1>
                        <p className="text-muted-foreground mt-1">
                            Track your verdict change proposals
                        </p>
                    </div>
                    <Link href="/core/verdict-proposals/new">
                        <Button>Propose New Verdict</Button>
                    </Link>
                </div>

                {proposals.length === 0 ? (
                    <div className="p-12 text-center border border-border rounded-md">
                        <p className="text-muted-foreground">
                            You haven&#39;t proposed any verdict changes yet.
                        </p>
                        <Link href="/core/verdict-proposals/new" className="mt-4 inline-block">
                            <Button>Propose Your First Verdict</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {proposals.map((proposal) => (
                            <div key={proposal.id} className="p-6 border border-border rounded-md">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {proposal.movie.title} ({proposal.movie.year})
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Proposed {new Date(proposal.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Proposed Verdict</p>
                                                <p className="font-bold text-primary">
                                                    {proposal.toVerdict.replace('_', '+')}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-sm italic">&quot;{proposal.shortVerdict}&quot;</p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded text-xs font-medium ${proposal.status === "APPROVED" ? "bg-green-100 text-green-800" :
                                                proposal.status === "REJECTED" ? "bg-red-100 text-red-800" :
                                                    "bg-yellow-100 text-yellow-800"
                                            }`}>
                                            {proposal.status}
                                        </span>
                                        <Link href={`/movie/${proposal.movie.slug}`}>
                                            <Button variant="outline" size="sm">
                                                View Movie
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
