"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MovieCarouselProps {
    title: string;
    linkUrl: string;
    movies: {
        id: number;
        title: string;
        posterUrl: string | null;
        releaseDate: string;
    }[];
}

export function MovieCarousel({ title, linkUrl, movies }: MovieCarouselProps) {
    if (!movies || movies.length === 0) return null;

    return (
        <div className="space-y-4 py-8">
            <div className="flex items-center justify-between px-4 md:px-0 max-w-7xl mx-auto">
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-foreground">
                    {title}
                </h2>
                <Link href={linkUrl} className="text-primary text-sm font-semibold hover:underline flex items-center">
                    SEE ALL MOVIES <ChevronRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="relative">
                <div className="flex overflow-x-auto gap-4 pb-4 px-4 md:px-0 max-w-7xl mx-auto snap-x scrollbar-hide">
                    {movies.map((movie) => (
                        <div key={movie.id} className="flex-none w-[160px] md:w-[200px] snap-start group relative">
                            <Link href={`/movie/${movie.id}-${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-lg relative">
                                    {movie.posterUrl ? (
                                        <img
                                            src={movie.posterUrl}
                                            alt={movie.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                                            No Image
                                        </div>
                                    )}
                                    {/* Gift Icon Placeholder / Overlay */}
                                    <div className="absolute top-2 right-2 bg-purple-600 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-bold">TIC</span>
                                    </div>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                        {movie.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(movie.releaseDate).getFullYear()}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}

                    {/* "View All" Card at the end */}
                    <div className="flex-none w-[160px] md:w-[200px] snap-start flex items-center justify-center">
                        <Link href={linkUrl} className="group flex flex-col items-center gap-2">
                            <div className="h-12 w-12 rounded-full border-2 border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <ChevronRight className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-semibold text-primary">View All</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
