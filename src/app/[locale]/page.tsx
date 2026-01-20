import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");
  const tNav = useTranslations("Navigation");

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight">
            {t("title")}
          </h1>

          <p className="text-xl text-muted-foreground">
            {t("subtitle")}
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/browse/movies">
              <Button size="lg">
                {tNav("browse")}
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="lg">
                {tNav("search")}
              </Button>
            </Link>
          </div>

          <div className="pt-12 text-sm text-muted-foreground space-y-2">
            <p className="opacity-80">Movies reviewed by verified cinephiles.</p>
            <p className="opacity-80">Earn trust through knowledge, not influence.</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto p-8">
          <h2 className="text-2xl font-bold mb-8 text-center">{tNav("howItWorks")}</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">1. Pass Factual Tests</h3>
              <p className="text-sm text-muted-foreground">
                Prove you&#39;ve watched a movie by passing a knowledge test.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">2. Write Reviews</h3>
              <p className="text-sm text-muted-foreground">
                Share thoughtful analysis. Private reviews are promoted based on quality.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">3. Trust-Based Verdicts</h3>
              <p className="text-sm text-muted-foreground">
                No ratings. Clear verdicts answering: &quot;Is this worth watching?&quot;
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/how-trust-works" className="text-primary hover:underline">
              {tNav("howItWorks")} →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
