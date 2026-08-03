import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — keeps the cookie alive on active use
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // Redirect unauthenticated users away from dashboard — except the public,
  // read-only /dashboard/demo/* walkthrough, which needs no session.
  const isDemoRoute = pathname.startsWith("/dashboard/demo");
  if (pathname.startsWith("/dashboard") && !isDemoRoute && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users away from login/signup
  if ((pathname === "/login" || pathname === "/signup") && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
