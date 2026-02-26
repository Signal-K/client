import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /* v8 ignore next 3 */
        getAll() {
          return req.cookies.getAll();
        },
        /* v8 ignore next 5 */
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: { headers: req.headers } });
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  let userId: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  if (!userId && req.nextUrl.pathname.startsWith("/game")) {
    const loginUrl = new URL("/auth", req.url);
    const nextPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  if (userId && req.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/game", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/game/:path*", "/auth/:path*"],
};
