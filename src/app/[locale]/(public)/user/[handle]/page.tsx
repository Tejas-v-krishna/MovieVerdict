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
                    author: { select: { name: true, handle: true } } // needed for card?
                },
                take: 10
            },
            followedBy: {
                where: { followerId: session?.user?.id ?? "0" }
            }
        }
    });

    if (!user) notFound();

    const isFollowing = user.followedBy.length > 0;
    const isOwner = session?.user?.id === user.id;

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Profile Card */}
                <div className="bg-card border rounded-lg p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32">
                        <AvatarImage src={user.reviewerProfile?.avatarUrl || user.image || ""} />
                        <AvatarFallback className="text-2xl">{user.name?.[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <h1 className="text-3xl font-bold">{user.reviewerProfile?.displayName || user.name}</h1>
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
