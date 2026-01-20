import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { Link } from "@/navigation";
import { redirect } from "next/navigation";
import { getPosterUrl } from "@/lib/tmdb";

export default async function WatchlistPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const watchlist = await prisma.watchlist.findMany({
        where: { userId: session.user.id },
        include: {
            movie: true
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">My Watchlist</h1>
                <p className="text-muted-foreground">Movies you want to watch or review.</p>
            </div>

            {watchlist.length === 0 ? (
                <div className="p-12 border border-dashed rounded-lg text-center text-muted-foreground">
                    You haven't added any movies to your watchlist yet.
                    <br />
                    <Link href="/browse/movies" className="text-primary hover:underline mt-2 inline-block">
                        Browse Movies
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {watchlist.map(({ movie }) => (
                        <Link key={movie.id} href={`/movie/${movie.slug}`} className="group space-y-2">
                            <div className="aspect-[2/3] rounded-md overflow-hidden bg-muted relative">
                                {movie.posterUrl ? (
                                    <img
                                        src={movie.posterUrl}
                                        alt={movie.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        No Poster
                                    </div>
                                )}
                                {movie.currentVerdict && (
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-bold rounded">
                                        {movie.currentVerdict.replace('_', '+')}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors">
                                    {movie.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">{movie.year}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
