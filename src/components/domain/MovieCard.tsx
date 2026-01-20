import Link from "next/link";
import type { Movie } from "@prisma/client";
import { getPosterUrl } from "@/lib/tmdb";
import { AddToListButton } from "./AddToListButton";
import { CardWatchlistButton } from "./CardWatchlistButton";

interface MovieCardProps {
    movie: {
        id?: string; // Added ID, but optional for search results that might lack it initially
        slug: string;
        title: string;
        year: number;
        posterUrl: string | null;
        currentVerdict?: Movie["currentVerdict"];
    };
    isWatchlisted?: boolean;
}

export function MovieCard({ movie, isWatchlisted = false }: MovieCardProps) {
    return (
        <div className="space-y-2 group relative">
            <div className="aspect-[2/3] bg-muted rounded-md overflow-hidden relative">
                <Link href={`/movie/${movie.slug}`} className="block w-full h-full">
                    {movie.posterUrl ? (
                        <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:opacity-90 transition"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No poster
                        </div>
                    )}
                </Link>

                {/* Overlay Actions */}
                {movie.id && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                        <AddToListButton movieId={movie.id} />
                        <CardWatchlistButton movieId={movie.id} initialIsWatchlisted={isWatchlisted} />
                    </div>
                )}
            </div>

            <div>
                <Link href={`/movie/${movie.slug}`} className="block">
                    <h3 className="font-medium line-clamp-2 group-hover:text-primary transition">
                        {movie.title}
                    </h3>
                </Link>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{movie.year}</span>
                    {movie.currentVerdict && (
                        <>
                            <span>•</span>
                            <span className="font-medium">{movie.currentVerdict.replace('_', '+')}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
