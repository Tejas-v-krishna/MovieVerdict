import { SearchForm } from "@/components/domain/SearchForm";
import { getPosterUrl, getNowPlayingMovies, getUpcomingMovies } from "@/lib/tmdb";
import { HeroBanner } from "@/components/home/HeroBanner";
import { MovieCarousel } from "@/components/home/MovieCarousel";
import { NewsSection } from "@/components/home/NewsSection";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";

// Force dynamic since we're fetching "Now Playing" which changes
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Parallel fetch for speed
  const [nowPlaying, upcoming] = await Promise.all([
    getNowPlayingMovies(),
    getUpcomingMovies()
  ]);

  const nowPlayingMovies = nowPlaying.results?.map(m => ({
    id: m.id,
    title: m.title,
    posterUrl: getPosterUrl(m.poster_path),
    releaseDate: m.release_date
  })) || [];

  const upcomingMovies = upcoming.results?.map(m => ({
    id: m.id,
    title: m.title,
    posterUrl: getPosterUrl(m.poster_path),
    releaseDate: m.release_date
  })) || [];

  return (
    <main className="min-h-screen bg-background">

      {/* 1. Hero Section */}
      <HeroBanner />

      {/* 2. Global Search Bar (Fandango Style - prominent strip) */}
      <div className="bg-primary py-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-3xl mx-auto px-4 flex gap-2">
          <div className="flex-1">
            <SearchForm className="w-full bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/70" />
          </div>
        </div>
      </div>

      <div className="space-y-4 pb-12">
        {/* 3. Movies In Theaters */}
        <MovieCarousel
          title="Movies in Theaters"
          linkUrl="/browse/now-playing"
          movies={nowPlayingMovies}
        />

        {/* 4. Coming Soon */}
        <MovieCarousel
          title="Coming Soon to Theaters"
          linkUrl="/browse/upcoming"
          movies={upcomingMovies}
        />

        {/* 5. News Section */}
        <NewsSection />

        {/* 6. Watch At Home (Reuse Now Playing for demo, but typically different data) */}
        <MovieCarousel
          title="Watch at Home"
          linkUrl="/browse/streaming"
          movies={nowPlayingMovies.slice().reverse()}
        />
      </div>
    </main>
  );
}
