import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight">
            MovieVerdict
          </h1>

          <p className="text-xl text-muted-foreground">
            A trust-first movie verdict & review platform
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/browse/movies">
              <Button size="lg">
                Browse Movies
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="lg">
                Search
              </Button>
            </Link>
          </div>

          <div className="pt-12 text-sm text-muted-foreground space-y-2">
            <p>Movies reviewed by verified cinephiles.</p>
            <p>Earn trust through knowledge, not influence.</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto p-8">
          <h2 className="text-2xl font-bold mb-8 text-center">How MovieVerdict Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">1. Pass Factual Tests</h3>
              <p className="text-sm text-muted-foreground">
                Prove you&#39;ve watched a movie by passing a knowledge test. Questions are factual—no opinions.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">2. Write Reviews</h3>
              <p className="text-sm text-muted-foreground">
                Share thoughtful analysis. Private reviews are promoted by Core Reviewers based on quality.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">3. Trust-Based Verdicts</h3>
              <p className="text-sm text-muted-foreground">
                No ratings. Clear verdicts (S+ to C) answer: &quot;Is this worth watching?&quot;
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/how-trust-works" className="text-primary hover:underline">
              Learn more about how trust works →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto p-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-3">About</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/how-trust-works" className="text-muted-foreground hover:text-foreground">
                    How Trust Works
                  </Link>
                </li>
                <li>
                  <Link href="/rules" className="text-muted-foreground hover:text-foreground">
                    Community Rules
                  </Link>
                </li>
                <li>
                  <Link href="/conflict-of-interest" className="text-muted-foreground hover:text-foreground">
                    Conflict of Interest
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Browse</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/browse/movies" className="text-muted-foreground hover:text-foreground">
                    All Movies
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="text-muted-foreground hover:text-foreground">
                    Search
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-foreground">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-muted-foreground hover:text-foreground">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/me" className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">MovieVerdict</h4>
              <p className="text-sm text-muted-foreground">
                Knowledge-gated movie reviews.
                Independent and ad-free.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2026 MovieVerdict. Built with integrity.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
