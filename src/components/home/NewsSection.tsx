import Link from "next/link";
import { ArrowRight } from "lucide-react";

const NEWS_ITEMS = [
    {
        id: 1,
        title: "Golden Globes 2026: The Complete Winners List",
        image: "https://image.tmdb.org/t/p/w500/u3YQJctMzFN2wBdEAQ08Gjf6KDB.jpg",
        category: "AWARDS",
        date: "2 hours ago"
    },
    {
        id: 2,
        title: "'Dune: Messiah' Wraps Filming, Sets December Release",
        image: "https://image.tmdb.org/t/p/w500/8dTWj3c74RDhXfSUZpuyVqzqpMX.jpg",
        category: "PRODUCTION",
        date: "5 hours ago"
    },
    {
        id: 3,
        title: "Christopher Nolan's Next Project Revealed",
        image: "https://image.tmdb.org/t/p/w500/opMUhCd2wX48lD3ZfS8M5eY5pB.jpg",
        category: "DIRECTORS",
        date: "1 day ago"
    },
    {
        id: 4,
        title: "Why 'The Batman Part II' Is Delaying Production",
        image: "https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
        category: "RUMORS",
        date: "2 days ago"
    }
];

export function NewsSection() {
    return (
        <div className="bg-muted/10 py-12">
            <div className="max-w-7xl mx-auto px-4 md:px-0">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide">
                        Movie News
                    </h2>
                    <Link href="/news" className="text-primary text-sm font-semibold hover:underline flex items-center">
                        SEE ALL NEWS <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {NEWS_ITEMS.map((item) => (
                        <Link key={item.id} href="#" className="group block h-full">
                            <div className="bg-card border border-border rounded-lg overflow-hidden h-full hover:shadow-lg transition-shadow">
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded">
                                        {item.category}
                                    </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    <h3 className="font-bold leading-tight group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">{item.date}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
