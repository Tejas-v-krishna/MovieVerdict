import { auth } from "@/lib/auth"
import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"

const intlMiddleware = createMiddleware({
    locales: ['en', 'ja'],
    defaultLocale: 'en',
    localePrefix: 'always'
});

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // Public routes regex to match /en/login, /jp/about, etc.
    // Matches: / (root), /login, /signup, /how-trust-works... with optional locale prefix
    const publicPages = [
        '/',
        '/login',
        '/signup',
        '/verify-email',
        '/how-trust-works',
        '/rules',
        '/spoilers',
        '/conflict-of-interest',
        '/privacy',
        '/terms',
        '/browse/movies',
        '/search' // Added search and browse to public
    ];

    const publicPathnameRegex = RegExp(
        `^(/(${['en', 'ja'].join('|')}))?(${publicPages.join('|').replace(/\//g, '\\/')})/?$`,
        'i'
    );

    const isPublicRoute = publicPathnameRegex.test(nextUrl.pathname) || nextUrl.pathname.startsWith('/api/');

    // Redirect to login if accessing protected route while not logged in
    if (!isPublicRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL('/en/login', nextUrl));
    }

    // Redirect to dashboard if accessing auth pages while logged in
    const isAuthPage = nextUrl.pathname.includes('/login') || nextUrl.pathname.includes('/signup');
    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/en/me', nextUrl));
    }

    return intlMiddleware(req);
});

export const config = {
    // Matcher: Skip all internal paths (_next), api routes (handled above mostly but good to exclude from intl if needed?), and static files
    // But we WANT to run middleware on most paths to handle protection
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
