"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('Navigation'); // Or generic 'Common'

    const toggleLocale = () => {
        const nextLocale = locale === 'en' ? 'ja' : 'en';
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            className="w-12"
        >
            {locale === 'en' ? '🇯🇵' : '🇺🇸'}
        </Button>
    );
}
