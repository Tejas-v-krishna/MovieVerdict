export interface TMDBMovie {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    genre_ids?: number[];
    genres?: { id: number; name: string }[];
    runtime?: number;
    vote_average: number;
    vote_count: number;
    original_language: string;
}

export interface TMDBMovieDetails extends TMDBMovie {
    runtime: number;
    genres: { id: number; name: string }[];
    spoken_languages: { english_name: string; iso_639_1: string }[];
    credits?: {
        cast: { name: string; character: string; profile_path: string | null }[];
        crew: { name: string; job: string }[];
    };
}

export interface TMDBSearchResponse {
    page: number;
    results: TMDBMovie[];
    total_pages: number;
    total_results: number;
}
