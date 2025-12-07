import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers)
    const hostname = request.headers.get('host') || ''

    // Subdomain logic: Extract region code from the first part of the hostname
    let regionCode = ''
    const parts = hostname.split('.')
    // Basic check: needs at least 2 parts (subdomain.domain) and subdomain shouldn't be www
    if (parts.length > 1) {
        const potentialRegion = parts[0]
        // Filter out common non-region subdomains
        if (potentialRegion !== 'www' && potentialRegion !== 'encontra' && !potentialRegion.startsWith('localhost')) {
            regionCode = potentialRegion
        }
        // Explicitly handle localhost subdomains for development (e.g. tdf.localhost)
        if (hostname.includes('localhost') && parts[0] !== 'localhost') {
            regionCode = parts[0]
        }
    }

    if (regionCode) {
        requestHeaders.set('x-encontra-region', regionCode)
    }

    let response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Redirect /login and /register to /admin if already logged in
    if (['/login', '/register'].includes(request.nextUrl.pathname)) {
        if (user) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
