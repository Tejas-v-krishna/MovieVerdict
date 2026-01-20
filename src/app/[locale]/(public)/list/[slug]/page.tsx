import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { MovieCard } from "@/components/domain/MovieCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";

interface ListPageProps {
    params: { slug: string };
}

export default async function ListPage({ params }: ListPageProps) {
    const session = await auth();
    const userId = session?.user?.id;

    const list = await prisma.curatedList.findUnique({
        where: { slug: params.slug },
        include: {
            createdBy: {
                include: { reviewerProfile: true }
            },
            items: {
                orderBy: { order: 'asc' },
                include: {
                    movie: {
                        include: {
                            watchlist: userId ? {
                                where: { userId },
                                select: { movieId: true }
                            } : false
                        }
                    }
                }
            }
        }
    });

    if (!list) notFound();
    if (!list.isPublic) {
        // Auth check or 404
        const session = await auth();
        if (session?.user?.id !== list.createdById) return notFound();
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Heaer */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold">{list.title}</h1>
                    {list.description && (
                        <p className="text-xl text-muted-foreground">{list.description}</p>
                    )}

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Curated by</span>
                        <Link href={`/user/${list.createdBy.handle || list.createdBy.id}`} className="flex items-center gap-2 hover:underline">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={list.createdBy.reviewerProfile?.avatarUrl || list.createdBy.image || ""} />
                                <AvatarFallback>{list.createdBy.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{list.createdBy.name}</span>
                        </Link>
                    </div>
                </div>

                {/* Items */}
                {list.items.length === 0 ? (
                    <div className="p-12 border border-dashed rounded-lg text-center text-muted-foreground">
                        This list is empty.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        {list.items.map((item) => (
                            <div key={item.id} className="space-y-2">
                                <MovieCard movie={item.movie} />
                                {item.note && (
                                    <p className="text-sm text-muted-foreground italic">"{item.note}"</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
