import { auth } from "@/lib/auth";
import { getUserLists } from "@/lib/actions/list";
import { CreateListButton } from "./CreateListButton";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function MyListsPage() {
    const session = await auth();
    const lists = await getUserLists(session?.user?.id!);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Curated Lists</h1>
                <CreateListButton />
            </div>

            {lists.length === 0 ? (
                <div className="text-center p-12 border border-dashed rounded-lg text-muted-foreground">
                    You haven't created any lists yet.
                </div>
            ) : (
                <div className="grid gap-4">
                    {lists.map((list) => (
                        <div key={list.id} className="p-4 border rounded-lg flex justify-between items-center bg-card">
                            <div>
                                <Link href={`/list/${list.slug}`} className="font-semibold text-lg hover:underline">
                                    {list.title}
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                    {list.isPublic ? "Public" : "Private"} • {list._count.items} items
                                </p>
                            </div>
                            <Link href={`/list/${list.slug}`}>
                                <Button variant="ghost" size="sm">View</Button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
