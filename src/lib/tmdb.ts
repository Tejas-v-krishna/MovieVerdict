import type { TMDBMovie, TMDBMovieDetails, TMDBSearchResponse } from "@/types/tmdb";
import prisma from "@/lib/db";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

if (!TMDB_API_KEY) {
    console.warn("⚠️ TMDB_API_KEY not set. Movie data fetching will fail.");
}

async function tmdbFetch<T>(endpoint: string): Promise<T> {
    const url = `${TMDB_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${TMDB_API_KEY}`,
            'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
    }

    return response.json();
}

export async function searchMovies(query: string, page = 1): Promise<TMDBSearchResponse> {
    return tmdbFetch<TMDBSearchResponse>(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
}

export async function getTrendingMovies(page = 1): Promise<TMDBSearchResponse> {
    return tmdbFetch<TMDBSearchResponse>(`/trending/movie/week?page=${page}`);
}

export async function getPopularMovies(page = 1): Promise<TMDBSearchResponse> {
    return tmdbFetch<TMDBSearchResponse>(`/movie/popular?page=${page}`);
}

export async function getMovieDetails(tmdbId: number): Promise<TMDBMovieDetails> {
    return tmdbFetch<TMDBMovieDetails>(`/movie/${tmdbId}?append_to_response=credits`);
}

export async function getNowPlayingMovies(page = 1): Promise<TMDBSearchResponse> {
    return tmdbFetch<TMDBSearchResponse>(`/movie/now_playing?page=${page}&region=US`);
}

export async function getUpcomingMovies(page = 1): Promise<TMDBSearchResponse> {
    return tmdbFetch<TMDBSearchResponse>(`/movie/upcoming?page=${page}&region=US`);
}

/**
 * Fetch movie from TMDB and cache in database
 */
export async function fetchAndCacheMovie(tmdbId: number) {
    const details = await getMovieDetails(tmdbId);

    const slug = `${details.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${tmdbId}`;

    const movie = await prisma.movie.upsert({
        where: { tmdbId },
        create: {
            tmdbId,
            slug,
            title: details.title,
            originalTitle: details.original_title,
            year: new Date(details.release_date).getFullYear(),
            synopsis: details.overview,
            posterUrl: details.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${details.poster_path}` : null,
            backdropUrl: details.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/original${details.backdrop_path}` : null,
            runtime: details.runtime,
            languages: details.spoken_languages?.map(l => l.english_name) || [],
            genres: details.genres?.map(g => g.name) || [],
        },
        update: {
            title: details.title,
            synopsis: details.overview,
            posterUrl: details.poster_path ? `${TMDB_IMAGE_BASE_URL}/w500${details.poster_path}` : null,
            runtime: details.runtime,
            languages: details.spoken_languages?.map(l => l.english_name) || [],
            genres: details.genres?.map(g => g.name) || [],
            updatedAt: new Date(),
        },
    });

    return movie;
}

/**
 * Get poster URL helper
 */
export function getPosterUrl(posterPath: string | null, size: 'w200' | 'w500' | 'original' = 'w500'): string {
    if (!posterPath) return '/placeholder-movie.png';
    return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
}
