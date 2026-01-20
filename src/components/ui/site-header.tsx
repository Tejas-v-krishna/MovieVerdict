import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "./button";

export async function SiteHeader() {
    const session = await auth();

    return (
        <header className="border-b border-border bg-background sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="text-xl font-bold">
                        MovieVerdict
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-6">
                        <Link href="/browse/movies" className="text-sm hover:text-primary">
                            Browse
                        </Link>
                        <Link href="/search" className="text-sm hover:text-primary">
                            Search
                        </Link>
                        <Link href="/how-trust-works" className="text-sm hover:text-primary">
                            How It Works
                        </Link>

                        {/* Auth */}
                        {session ? (
                            <>
                                {session.user.role === "ADMIN" && (
                                    <>
                                        <Link href="/admin/users" className="text-sm hover:text-primary">
                                            Admin
                                        </Link>
                                        <Link href="/admin/tests" className="text-sm hover:text-primary">
                                            Tests
                                        </Link>
                                        <Link href="/admin/verdict-proposals" className="text-sm hover:text-primary">
                                            Verdicts
                                        </Link>
                                    </>
                                )}
                                {(session.user.role === "CORE_REVIEWER" || session.user.role === "ADMIN") && (
                                    <Link href="/core/promotions" className="text-sm hover:text-primary">
                                        Promotions
                                    </Link>
                                )}
                                <Link href="/me">
                                    <Button variant="outline" size="sm">
                                        Dashboard
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button size="sm">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
