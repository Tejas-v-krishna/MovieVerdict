import { MovieCard } from "@/components/domain/MovieCard";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { FilterSidebar } from "./FilterSidebar";

interface BrowseProps {
    searchParams: Promise<{
        verdict?: string;
        genre?: string;
        year?: string;
    }>
}

export default async function BrowseMoviesPage({ searchParams }: BrowseProps) {
    const params = await searchParams;
    const verdictFilter = params.verdict ? params.verdict.split(',') : [];
    const genreFilter = params.genre ? params.genre.split(',') : [];
    const yearFilter = params.year ? parseInt(params.year) : undefined;

    // Prisma Query Construction
    const where: Prisma.MovieWhereInput = {};

    if (verdictFilter.length > 0) {
        where.currentVerdict = { in: verdictFilter as any };
    }

    if (genreFilter.length > 0) {
        where.genres = { hasSome: genreFilter };
    }

    if (yearFilter) {
        where.year = yearFilter;
    }

    const { auth } = await import("@/lib/auth");
    const session = await auth();
    const userId = session?.user?.id;

    // Always fetch from DB now to allow filtering
    const movies = await prisma.movie.findMany({
        where,
        orderBy: [
            { updatedAt: 'desc' }, // Recently updated/reviewed
            { createdAt: 'desc' }
        ],
        take: 50,
        include: {
            watchlist: userId ? {
                where: { userId }
            } : false
        }
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Browse Movies</h1>
                    <p className="text-muted-foreground mt-1">
                        Explore verdicts and reviews from the community.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <FilterSidebar
                            currentVerdict={verdictFilter}
                            currentGenre={genreFilter}
                            currentYear={params.year}
                        />
                    </aside>

                    {/* Results Grid */}
                    <div className="flex-1">
                        {movies.length === 0 ? (
                            <div className="text-center py-12 border border-dashed rounded-lg">
                                <p className="text-muted-foreground mb-4">No movies match your filters.</p>
                                <Link href="/browse/movies">
                                    <Button variant="outline">Clear Filters</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                {movies.map((movie) => (
                                    <MovieCard
                                        key={movie.id}
                                        movie={movie}
                                        isWatchlisted={movie.watchlist && movie.watchlist.length > 0}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
