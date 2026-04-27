import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // supabaseResponse must be returned or have its cookies copied to any
  // response you return — see Supabase SSR docs.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update request cookies so the server component sees them,
          // and update supabaseResponse so the browser gets them.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() validates + refreshes the token. Cookie writes land on
  // supabaseResponse — the only safe place for them.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Helper: build a redirect that carries any refreshed auth cookies.
  function redirectWithCookies(url: URL) {
    const redirect = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...rest }) => {
      redirect.cookies.set(name, value, rest as Parameters<typeof redirect.cookies.set>[2]);
    });
    return redirect;
  }

  if (user && pathname === "/") {
    return redirectWithCookies(new URL("/game?from=landing", request.url));
  }

  if (!user && pathname.startsWith("/game")) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return redirectWithCookies(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/", "/game/:path*"],
};
