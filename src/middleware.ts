import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { pathname } = req.nextUrl
    const isLoggedIn = !!req.auth

    // Public routes that don't require auth
    const publicRoutes = [
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
    ]

    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth'))

    // Redirect to login if accessing protected route while not logged in
    if (!isPublicRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // Redirect to home if accessing auth pages while logged in
    if ((pathname === '/login' || pathname === '/signup') && isLoggedIn) {
        return NextResponse.redirect(new URL('/me', req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
