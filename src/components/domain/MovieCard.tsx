import Link from "next/link";
import type { Movie } from "@prisma/client";
import { getPosterUrl } from "@/lib/tmdb";

interface MovieCardProps {
    movie: {
        slug: string;
        title: string;
        year: number;
        posterUrl: string | null;
        currentVerdict?: Movie["currentVerdict"];
    };
}

export function MovieCard({ movie }: MovieCardProps) {
    return (
        <Link href={`/movie/${movie.slug}`} className="block group">
            <div className="space-y-2">
                <div className="aspect-[2/3] bg-muted rounded-md overflow-hidden">
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
                </div>

                <div>
                    <h3 className="font-medium line-clamp-2 group-hover:text-primary transition">
                        {movie.title}
                    </h3>
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
        </Link>
    );
}
