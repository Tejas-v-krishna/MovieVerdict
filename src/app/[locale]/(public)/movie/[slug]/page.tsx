import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { fetchAndCacheMovie } from "@/lib/tmdb";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { getUserTestStatus } from "@/lib/test-helpers";
import { ReviewCard } from "@/components/domain/ReviewCard";

interface MoviePageProps {
    params: { slug: string };
}

export default async function MoviePage({ params }: MoviePageProps) {
    const session = await auth();
    const { slug } = params;

    // Try to find movie by slug
    let movie = await prisma.movie.findUnique({
        where: { slug },
        include: {
            reviews: {
                where: { visibility: "PUBLIC", status: "PUBLISHED" },
                include: { author: { select: { name: true, handle: true } } },
                orderBy: { createdAt: "desc" },
            },
            verdictHistory: {
                include: {
                    requestedBy: { select: { name: true, handle: true } },
                    approvedBy: { select: { name: true, handle: true } },
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    // If not found, try to extract TMDB ID from slug and fetch
    if (!movie) {
        const tmdbIdMatch = slug.match(/-(\d+)$/);
        if (tmdbIdMatch) {
            const tmdbId = parseInt(tmdbIdMatch[1]);
            try {
                const cached = await fetchAndCacheMovie(tmdbId);
                movie = await prisma.movie.findUnique({
                    where: { id: cached.id },
                    include: {
                        reviews: {
                            where: { visibility: "PUBLIC", status: "PUBLISHED" },
                            include: { author: { select: { name: true, handle: true } } },
                            orderBy: { createdAt: "desc" },
                        },
                        verdictHistory: {
                            include: {
                                requestedBy: { select: { name: true, handle: true } },
                                approvedBy: { select: { name: true, handle: true } },
                            },
                            orderBy: { createdAt: "desc" },
                        },
                    },
                });
            } catch (error) {
                console.error("Failed to fetch movie:", error);
                notFound();
            }
        } else {
            notFound();
        }
    }

    if (!movie) {
        notFound();
    }

    // Get test status for current user
    let testStatus = null;
    if (session) {
        testStatus = await getUserTestStatus(movie.id, session.user.id!);
    }

    // Check if user already has a review
    let userReview = null;
    if (session) {
        userReview = await prisma.review.findFirst({
            where: { movieId: movie.id, authorId: session.user.id! },
        });
    }

    const canWriteReview = session && testStatus?.hasPassed && !userReview &&
        (session.user.role === "NON_CORE_MEMBER" || session.user.role === "CORE_REVIEWER" || session.user.role === "ADMIN");

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-muted">
                {movie.backdropUrl && (
                    <div className="absolute inset-0 opacity-20">
                        <img
                            src={movie.backdropUrl}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="relative max-w-7xl mx-auto p-8">
                    <div className="flex gap-8">
                        {/* Poster */}
                        {movie.posterUrl && (
                            <div className="flex-shrink-0 w-48 aspect-[2/3] rounded-md overflow-hidden">
                                <img
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-4xl font-bold">{movie.title}</h1>
                                <p className="text-xl text-muted-foreground">{movie.year}</p>
                            </div>

                            {/* Verdict */}
                            {movie.currentVerdict ? (
                                <div className="space-y-2">
                                    <div className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-lg font-bold">
                                        {movie.currentVerdict.replace('_', '+')}
                                    </div>
                                    {movie.currentShortVerdict && (
                                        <p className="text-lg italic">&quot;{movie.currentShortVerdict}&quot;</p>
                                    )}
                                </div>
                            ) : (
                                <div className="px-4 py-2 bg-muted border border-border rounded-md inline-block">
                                    <span className="text-muted-foreground">No verdict yet</span>
                                </div>
                            )}

                            {/* Meta */}
                            <div className="flex gap-4 text-sm text-muted-foreground">
                                {movie.runtime && <span>{movie.runtime} min</span>}
                                {movie.genres.length > 0 && (
                                    <span>{movie.genres.slice(0, 3).join(', ')}</span>
                                )}
                            </div>

                            {/* Test/Review Actions */}
                            {session && testStatus && (
                                <div className="pt-4 space-y-3">
                                    {!testStatus.hasTest && (
                                        <p className="text-sm text-muted-foreground">
                                            No knowledge test available yet for this movie.
                                        </p>
                                    )}

                                    {testStatus.hasTest && !testStatus.hasPassed && (
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                Pass the knowledge test to unlock reviewing
                                            </p>
                                            <Button asChild>
                                                <a href={`/movie/${movie.slug}/test`}>Take Knowledge Test</a>
                                            </Button>
                                        </div>
                                    )}

                                    {canWriteReview && (
                                        <div className="space-y-2">
                                            <p className="text-sm text-green-600 font-medium">
                                                ✅ You can review this movie
                                            </p>
                                            <Button asChild>
                                                <a href={`/movie/${movie.slug}/review/new`}>Write Review</a>
                                            </Button>
                                        </div>
                                    )}

                                    {userReview && (
                                        <div className="text-sm text-muted-foreground">
                                            You&apos;ve already reviewed this movie.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
                <div className="max-w-7xl mx-auto px-8">
                    <nav className="flex gap-6">
                        <button className="py-4 border-b-2 border-primary font-medium">
                            Overview
                        </button>
                        <button className="py-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground">
                            Reviews ({movie.reviews.length})
                        </button>
                        <button className="py-4 border-b-2 border-transparent text-muted-foreground hover:text-foreground">
                            Verdict History
                        </button>
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto p-8 space-y-12">
                {/* Synopsis */}
                <div className="prose max-w-none">
                    <h2>Synopsis</h2>
                    <p>{movie.synopsis || "No synopsis available."}</p>

                    {movie.languages.length > 0 && (
                        <>
                            <h3>Languages</h3>
                            <p>{movie.languages.join(', ')}</p>
                        </>
                    )}
                </div>

                {/* Reviews */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Reviews</h2>

                    {movie.reviews.length === 0 ? (
                        <div className="p-6 bg-muted rounded-md text-center">
                            <p className="text-muted-foreground">
                                No public reviews yet. Be the first to review this movie!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {movie.reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
