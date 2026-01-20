import Link from "next/link";
import type { Movie } from "@prisma/client";
import { getPosterUrl } from "@/lib/tmdb";
import { AddToListButton } from "./AddToListButton";

interface MovieCardProps {
    movie: {
        id: string; // Added ID
        slug: string;
        title: string;
        year: number;
        posterUrl: string | null;
        currentVerdict?: Movie["currentVerdict"];
    };
}

export function MovieCard({ movie }: MovieCardProps) {
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

                {/* Overlay Action */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AddToListButton movieId={movie.id} />
                </div>
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
