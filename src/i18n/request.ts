import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/navigation';

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically works; requestLocale is a promise in newer versions or string in older.
    // Ensure we handle it correctly.
    let locale = await requestLocale;

    // Validate that the incoming `locale` parameter is valid
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
