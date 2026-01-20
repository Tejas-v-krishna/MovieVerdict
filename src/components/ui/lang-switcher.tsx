"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/navigation";
import { ChangeEvent, useTransition } from "react";

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', label: 'Português', flag: '🇵🇹' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <div className="relative inline-block text-left">
            <select
                onChange={onSelectChange}
                defaultValue={locale}
                disabled={isPending}
                className="appearance-none bg-transparent border border-border text-foreground py-1 px-3 pr-8 rounded focus:outline-none focus:ring-1 focus:ring-ring text-lg cursor-pointer hover:bg-muted"
            >
                {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-popover text-popover-foreground">
                        {lang.flag} {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
