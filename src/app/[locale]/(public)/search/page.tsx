import { searchMovies } from "@/lib/tmdb";
import { MovieCard } from "@/components/domain/MovieCard";
import { SearchForm } from "@/components/domain/SearchForm";
import prisma from "@/lib/db";

interface SearchPageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q } = await searchParams;
    const query = q || "";

    if (!query) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Search Movies</h1>
                    <SearchForm />
                </div>
            </div>
        );
    }

    let results;
    try {
        results = await searchMovies(query);
    } catch (e) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold">Search Error</h1>
                    <p className="text-red-500 mt-4">
                        Failed to search movies. Please ensure TMDB_API_KEY is set in .env.
                    </p>
                </div>
            </div>
        );
    }

    const { auth } = await import("@/lib/auth");
    const session = await auth();
    const userId = session?.user?.id;

    // Check which movies exist in our DB
    const tmdbIds = results.results.map(m => m.id);
    const existingMovies = await prisma.movie.findMany({
        where: { tmdbId: { in: tmdbIds } },
        select: {
            id: true,
            tmdbId: true,
            slug: true,
            currentVerdict: true,
            watchlist: userId ? {
                where: { userId },
                select: { movieId: true } // just check existence
            } : false
        },
    });

    const moviesMap = new Map(existingMovies.map(m => [m.tmdbId, m]));

    const movies = results.results.map(tmdbMovie => {
        const dbMovie = moviesMap.get(tmdbMovie.id);
        return {
            slug: dbMovie?.slug || `${tmdbMovie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${tmdbMovie.id}`,
            title: tmdbMovie.title,
            year: new Date(tmdbMovie.release_date).getFullYear(),
            posterUrl: tmdbMovie.poster_path
                ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
                : null,
            currentVerdict: dbMovie?.currentVerdict,
            isWatchlisted: dbMovie?.watchlist && dbMovie.watchlist.length > 0
        };
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-6">Search Results for &quot;{query}&quot;</h1>
                    <div className="mb-8">
                        <SearchForm />
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Found {results.total_results} results
                    </p>
                </div>

                {movies.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        No results found. Try a different search term.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {movies.map((movie) => (
                            <MovieCard
                                key={movie.slug}
                                movie={movie}
                                isWatchlisted={movie.isWatchlisted}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
