import { auth } from "@/lib/auth";
import { Button } from "./button";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./lang-switcher";
import { NotificationBell } from "@/components/domain/NotificationBell";
import prisma from "@/lib/db";

export function SiteHeader() {
    const t = useTranslations('Navigation');
    return <AuthAwareHeader t={t} />;
}

async function AuthAwareHeader({ t }: { t: any }) {
    const session = await auth();

    let notifications: any[] = [];
    if (session?.user?.id) {
        notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
    }

    return (
        <header className="border-b border-border bg-background sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link href="/" className="text-xl font-bold">
                        MovieVerdict
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-4">
                        <Link href="/browse/movies" className="text-sm hover:text-primary">
                            {t('browse')}
                        </Link>
                        <Link href="/search" className="text-sm hover:text-primary">
                            {t('search')}
                        </Link>
                        <Link href="/how-trust-works" className="text-sm hover:text-primary">
                            {t('howItWorks')}
                        </Link>

                        <LanguageSwitcher />

                        {/* Auth */}
                        {session ? (
                            <>
                                <NotificationBell initialNotifications={notifications} />

                                {session.user.role === "ADMIN" && (
                                    <>
                                        <Link href="/admin/users" className="text-sm hover:text-primary hidden md:inline-block">
                                            {t('admin')}
                                        </Link>
                                        <Link href="/admin/tests" className="text-sm hover:text-primary hidden md:inline-block">
                                            {t('tests')}
                                        </Link>
                                        <Link href="/admin/verdict-proposals" className="text-sm hover:text-primary hidden md:inline-block">
                                            {t('verdicts')}
                                        </Link>
                                    </>
                                )}
                                {(session.user.role === "CORE_REVIEWER" || session.user.role === "ADMIN") && (
                                    <Link href="/core/promotions" className="text-sm hover:text-primary hidden md:inline-block">
                                        {t('promotions')}
                                    </Link>
                                )}
                                <Link href="/me">
                                    <Button variant="outline" size="sm">
                                        {t('dashboard')}
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        {t('login')}
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button size="sm">
                                        {t('signUp')}
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
