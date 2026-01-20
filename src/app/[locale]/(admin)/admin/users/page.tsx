import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { changeUserRoleAction, banUserAction } from "./actions";

export default async function AdminUsersPage() {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: {
                    reviews: true,
                    testAttempts: { where: { passed: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage user roles and access
                    </p>
                </div>

                <div className="border border-border rounded-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left p-4">User</th>
                                <th className="text-left p-4">Role</th>
                                <th className="text-left p-4">Activity</th>
                                <th className="text-left p-4">Joined</th>
                                <th className="text-left p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-t border-border">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium">{user.name || user.handle}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                            {user.handle && (
                                                <p className="text-xs text-muted-foreground">@{user.handle}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === "ADMIN" ? "bg-red-100 text-red-800" :
                                                user.role === "CORE_REVIEWER" ? "bg-blue-100 text-blue-800" :
                                                    user.role === "NON_CORE_MEMBER" ? "bg-green-100 text-green-800" :
                                                        "bg-gray-100 text-gray-800"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <p>{user._count.reviews} reviews</p>
                                        <p className="text-muted-foreground">{user._count.testAttempts} tests passed</p>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <form action={changeUserRoleAction}>
                                                <input type="hidden" name="userId" value={user.id} />
                                                <select
                                                    name="newRole"
                                                    className="text-xs px-2 py-1 border border-input rounded"
                                                    defaultValue={user.role}
                                                >
                                                    <option value="VIEWER">Viewer</option>
                                                    <option value="NON_CORE_MEMBER">Non-Core</option>
                                                    <option value="CORE_REVIEWER">Core</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                                <Button type="submit" size="sm" variant="outline" className="ml-2">
                                                    Update
                                                </Button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
