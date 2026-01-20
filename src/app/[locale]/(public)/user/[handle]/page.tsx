import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/domain/FollowButton";
import { ReviewCard } from "@/components/domain/ReviewCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfileProps {
    params: { handle: string };
}

export default async function UserProfilePage({ params }: UserProfileProps) {
    const session = await auth();
    const handle = decodeURIComponent(params.handle); // Handle URL encoding if any

    const user = await prisma.user.findUnique({
        where: { handle },
        include: {
            reviewerProfile: true,
            _count: {
                select: {
                    reviews: true,
                    followedBy: true,
                    following: true,
                }
            },
            reviews: {
                where: { visibility: "PUBLIC", status: "PUBLISHED" },
                orderBy: { createdAt: "desc" },
                include: {
                    movie: true,
                    author: { select: { id: true, name: true, handle: true } }
                },
                take: 10
            },
            createdLists: {
                where: { isPublic: true },
                orderBy: { createdAt: "desc" },
                include: {
                    _count: { select: { items: true } }
                }
            },
            followedBy: {
                where: { followerId: session?.user?.id ?? "0" }
            }
        }
    });

    if (!user) notFound();

    const isOwner = session?.user?.id === user.id;

    // Calculate Compatibility
    let compatibility: number | null = null;
    let commonMoviesCount = 0;

    if (session?.user?.id && !isOwner) {
        const myReviews = await prisma.review.findMany({
            where: {
                authorId: session.user.id,
                verdictLabel: { not: undefined } // Ensure verdict exists roughly
            },
            select: { movieId: true, verdictLabel: true }
        });

        const theirReviews = await prisma.review.findMany({
            where: {
                authorId: user.id,
                verdictLabel: { not: undefined }
            },
            select: { movieId: true, verdictLabel: true }
        });

        const { calculateCompatibilityScore } = await import("@/lib/compatibility");
        compatibility = calculateCompatibilityScore(myReviews as any, theirReviews as any); // Type assertion if needed

        // Count common just for display info
        const myMovieIds = new Set(myReviews.map(r => r.movieId));
        commonMoviesCount = theirReviews.filter(r => myMovieIds.has(r.movieId)).length;
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Profile Card */}
                <div className="bg-card border rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
                    {/* Compatibility Badge */}
                    {compatibility !== null && (
                        <div className="absolute top-4 right-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20" title={`Based on ${commonMoviesCount} shared movies`}>
                            {compatibility}% Taste Match
                        </div>
                    )}

                    <Avatar className="h-24 w-24 md:h-32 md:w-32">
                        <AvatarImage src={user.reviewerProfile?.avatarUrl || user.image || ""} />
                        <AvatarFallback className="text-2xl">{user.name?.[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <h1 className="text-3xl font-bold">{user.reviewerProfile?.displayName || user.name}</h1>
                            {user.reviewerProfile?.badges.map(badge => (
                                <span key={badge} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-200 font-medium">
                                    {badge}
                                </span>
                            ))}
                            {!isOwner && session && (
                                <FollowButton
                                    targetUserId={user.id}
                                    initialIsFollowing={isFollowing}
                                />
                            )}
                        </div>
                        <p className="text-muted-foreground">@{user.handle}</p>

                        {user.reviewerProfile?.bio && (
                            <p className="text-sm max-w-lg">{user.reviewerProfile.bio}</p>
                        )}

                        <div className="flex items-center justify-center md:justify-start gap-6 pt-2 text-sm">
                            <div className="text-center md:text-left">
                                <div className="font-bold text-lg">{user._count.reviews}</div>
                                <div className="text-muted-foreground">Reviews</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="font-bold text-lg">{user._count.followedBy}</div>
                                <div className="text-muted-foreground">Followers</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="font-bold text-lg">{user._count.following}</div>
                                <div className="text-muted-foreground">Following</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Curated Lists */}
                {user.createdLists.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Curated Lists</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            {user.createdLists.map((list) => (
                                <Link key={list.id} href={`/list/${list.slug}`} className="block group">
                                    <div className="p-6 border rounded-lg bg-card hover:border-primary transition-colors">
                                        <h3 className="font-bold text-lg group-hover:underline">{list.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                            {list.description || "No description"}
                                        </p>
                                        <div className="mt-4 flex items-center text-xs text-muted-foreground">
                                            <span>{list._count.items} movies</span>
                                            <span className="mx-2">•</span>
                                            <span>{new Date(list.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Reviews */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Recent Reviews</h2>
                    {user.reviews.length === 0 ? (
                        <p className="text-muted-foreground">This user hasn't published any reviews yet.</p>
                    ) : (
                        <div className="grid gap-6">
                            {user.reviews.map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={{
                                        ...review,
                                        author: { name: user.name, handle: user.handle }
                                    }}
                                    movie={review.movie}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
