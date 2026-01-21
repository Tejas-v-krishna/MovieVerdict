import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HeroBanner() {
    return (
        <div className="relative w-full h-[400px] md:h-[500px] bg-black overflow-hidden">
            {/* Background Image - Hardcoded for visual demo, would be dynamic in production */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{ backgroundImage: `url('https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vREc05475qg9.jpg')` }} // Avatar Way of Water or similar big movie
            ></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full">
                    <div className="max-w-xl space-y-6">
                        <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-bold tracking-wider uppercase rounded-sm">
                            Featured Verdict
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg">
                            AVATAR: <br /> WAY OF WATER
                        </h1>
                        <p className="text-lg text-gray-200 line-clamp-2 max-w-md drop-shadow-md">
                            Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/movie/avatar-the-way-of-water">
                                <Button size="lg" className="font-bold text-lg px-8 rounded-full">
                                    Read Verdict
                                </Button>
                            </Link>
                            <Link href="/browse/movies">
                                <Button size="lg" variant="outline" className="font-bold text-lg px-8 rounded-full border-white text-white hover:bg-white hover:text-black">
                                    See All Movies
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
