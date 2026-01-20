import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { approveVerdictAction, rejectVerdictAction } from "./actions";

export default async function AdminVerdictProposalsPage() {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const pendingProposals = await prisma.verdictHistory.findMany({
        where: { status: "PENDING" },
        include: {
            movie: { select: { title: true, year: true, slug: true, currentVerdict: true, currentShortVerdict: true } },
            requestedBy: { select: { name: true, handle: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Verdict Proposals</h1>
                    <p className="text-muted-foreground mt-1">
                        Review and approve verdict changes proposed by Core Reviewers
                    </p>
                </div>

                {pendingProposals.length === 0 ? (
                    <div className="p-12 text-center border border-border rounded-md">
                        <p className="text-muted-foreground">
                            No pending verdict proposals. All caught up!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pendingProposals.map((proposal) => (
                            <div key={proposal.id} className="p-6 border border-border rounded-md space-y-4">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {proposal.movie.title} ({proposal.movie.year})
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Proposed by @{proposal.requestedBy.handle} •{' '}
                                            {new Date(proposal.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <a
                                        href={`/movie/${proposal.movie.slug}`}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        View Movie
                                    </a>
                                </div>

                                {/* Verdict Change */}
                                <div className="p-4 bg-muted rounded-md space-y-2">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Current Verdict</p>
                                            <p className="font-bold text-lg">
                                                {proposal.movie.currentVerdict?.replace('_', '+') || 'None'}
                                            </p>
                                            {proposal.movie.currentShortVerdict && (
                                                <p className="text-sm italic">&quot;{proposal.movie.currentShortVerdict}&quot;</p>
                                            )}
                                        </div>
                                        <div className="text-2xl">→</div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Proposed Verdict</p>
                                            <p className="font-bold text-lg text-primary">
                                                {proposal.toVerdict.replace('_', '+')}
                                            </p>
                                            <p className="text-sm italic">&quot;{proposal.shortVerdict}&quot;</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reasoning */}
                                <div>
                                    <p className="font-medium mb-2">Reasoning:</p>
                                    <p className="text-sm whitespace-pre-wrap p-3 bg-muted rounded">
                                        {proposal.reason}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <form action={approveVerdictAction}>
                                        <input type="hidden" name="proposalId" value={proposal.id} />
                                        <Button type="submit" size="sm">
                                            Approve & Apply
                                        </Button>
                                    </form>

                                    <form action={rejectVerdictAction}>
                                        <input type="hidden" name="proposalId" value={proposal.id} />
                                        <Button type="submit" variant="destructive" size="sm">
                                            Reject
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
