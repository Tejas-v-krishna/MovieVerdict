import { getTrendingMovies } from "@/lib/tmdb";
import { MovieCard } from "@/components/domain/MovieCard";
import prisma from "@/lib/db";

export default async function BrowseMoviesPage() {
    let trending;
    try {
        trending = await getTrendingMovies();
    } catch (e) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-7xl mx-auto text-center space-y-4">
                    <h1 className="text-3xl font-bold">Configuration Needed</h1>
                    <p className="text-muted-foreground">
                        Failed to fetch movies. Please check your TMDB API Key in .env file.
                    </p>
                </div>
            </div>
        );
    }

    // Check which movies exist in our DB
    const tmdbIds = trending.results.map(m => m.id);
    const existingMovies = await prisma.movie.findMany({
        where: { tmdbId: { in: tmdbIds } },
        select: { tmdbId: true, slug: true, currentVerdict: true },
    });

    const moviesMap = new Map(existingMovies.map(m => [m.tmdbId, m]));

    const movies = trending.results.map(tmdbMovie => {
        const dbMovie = moviesMap.get(tmdbMovie.id);
        return {
            slug: dbMovie?.slug || `${tmdbMovie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${tmdbMovie.id}`,
            title: tmdbMovie.title,
            year: new Date(tmdbMovie.release_date).getFullYear(),
            posterUrl: tmdbMovie.poster_path
                ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`
                : null,
            currentVerdict: dbMovie?.currentVerdict,
        };
    });

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Trending Movies</h1>
                    <p className="text-muted-foreground mt-1">
                        Popular movies this week from TMDB
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {movies.map((movie) => (
                        <MovieCard key={movie.slug} movie={movie} />
                    ))}
                </div>
            </div>
        </div>
    );
}
