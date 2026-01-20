import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminDashboardPage() {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    // Get stats
    const stats = {
        totalUsers: await prisma.user.count(),
        totalReviews: await prisma.review.count(),
        totalMovies: await prisma.movie.count(),
        totalTests: await prisma.test.count(),
        pendingVerdicts: await prisma.verdictHistory.count({ where: { status: "PENDING" } }),
        pendingReviews: await prisma.review.count({ where: { visibility: "PRIVATE", status: "DRAFT" } }),
        activeTests: await prisma.test.count({ where: { status: "ACTIVE" } }),
    };

    // Recent audit logs
    const recentAudits = await prisma.auditLog.findMany({
        include: {
            actor: { select: { name: true, handle: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        System overview and management
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6">
                    <div className="p-6 border border-border rounded-lg text-center">
                        <p className="text-3xl font-bold">{stats.totalUsers}</p>
                        <p className="text-sm text-muted-foreground mt-1">Total Users</p>
                    </div>
                    <div className="p-6 border border-border rounded-lg text-center">
                        <p className="text-3xl font-bold">{stats.totalReviews}</p>
                        <p className="text-sm text-muted-foreground mt-1">Total Reviews</p>
                    </div>
                    <div className="p-6 border border-border rounded-lg text-center">
                        <p className="text-3xl font-bold">{stats.totalMovies}</p>
                        <p className="text-sm text-muted-foreground mt-1">Movies Cached</p>
                    </div>
                    <div className="p-6 border border-border rounded-lg text-center">
                        <p className="text-3xl font-bold">{stats.activeTests}</p>
                        <p className="text-sm text-muted-foreground mt-1">Active Tests</p>
                    </div>
                </div>

                {/* Pending Items */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 border border-border rounded-lg">
                        <h2 className="font-semibold text-lg mb-4">Pending Verdict Proposals</h2>
                        <p className="text-4xl font-bold mb-4">{stats.pendingVerdicts}</p>
                        <Button asChild>
                            <Link href="/admin/verdict-proposals">Review Proposals</Link>
                        </Button>
                    </div>

                    <div className="p-6 border border-border rounded-lg">
                        <h2 className="font-semibold text-lg mb-4">Private Reviews Pending</h2>
                        <p className="text-4xl font-bold mb-4">{stats.pendingReviews}</p>
                        <Button asChild>
                            <Link href="/core/promotions">Review Queue</Link>
                        </Button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="p-6 border border-border rounded-lg">
                    <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
                    <div className="flex gap-3 flex-wrap">
                        <Button asChild>
                            <Link href="/admin/tests/new">Create Test</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/admin/users">Manage Users</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/admin/tests">Manage Tests</Link>
                        </Button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="p-6 border border-border rounded-lg">
                    <h2 className="font-semibold text-lg mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                        {recentAudits.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent activity</p>
                        ) : (
                            recentAudits.map((audit) => (
                                <div key={audit.id} className="flex justify-between items-center text-sm p-3 bg-muted rounded">
                                    <div>
                                        <p className="font-medium">{audit.action.replace('_', ' ')}</p>
                                        <p className="text-muted-foreground text-xs">
                                            by @{audit.actor.handle} • {audit.targetType} {audit.targetId.slice(0, 8)}
                                        </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(audit.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
