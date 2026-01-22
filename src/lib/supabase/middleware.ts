import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Demo mode bypass
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    // Skip auth check for callback route
    if (request.nextUrl.pathname.startsWith('/auth/')) {
        return supabaseResponse;
    }

    // Protected routes - redirect to login if not authenticated (except in demo mode)
    const protectedPaths = ['/', '/settings', '/jobs'];
    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith('/jobs/')
    );

    if (!isDemoMode && !user && isProtectedPath) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Redirect logged-in users away from auth pages
    if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
