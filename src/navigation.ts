import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['en', 'ja', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'hi', 'ru', 'ko'],
    defaultLocale: 'en'
});

export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);
