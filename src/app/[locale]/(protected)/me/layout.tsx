import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { User, Heart, Settings, FileText, List } from "lucide-react";
import { useTranslations } from "next-intl";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
                <div className="font-semibold text-lg px-4 mb-2">My Account</div>

                <nav className="space-y-1">
                    <Link href="/me">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <User className="h-4 w-4" />
                            Overview
                        </Button>
                    </Link>
                    <Link href="/me/watchlist">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Heart className="h-4 w-4" />
                            Watchlist
                        </Button>
                    </Link>
                    <Link href="/me/lists">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <List className="h-4 w-4" />
                            My Lists
                        </Button>
                    </Link>
                    <Link href="/me/reviews">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <FileText className="h-4 w-4" />
                            My Reviews
                        </Button>
                    </Link>
                    <Link href="/me/settings">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Button>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
}
