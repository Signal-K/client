import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasSupabaseAuthCookie(req: NextRequest) {
  const cookies = req.cookies.getAll();
  return cookies.some(({ name, value }) => {
    if (!value) return false;
    if (name === "supabase-auth-token") return true;
    return /^sb-.*-auth-token(?:\.\d+)?$/.test(name);
  });
}

export function middleware(req: NextRequest) {
  const isAuthenticated = hasSupabaseAuthCookie(req);
  const { pathname } = req.nextUrl;

  // Authenticated users visiting the landing page → send straight to the game.
  // Cookie presence is sufficient here: if the access token is expired but the
  // refresh token is still valid, /game will resolve correctly. If both are
  // expired the game's own auth guard will redirect to /auth.
  if (isAuthenticated && pathname === "/") {
    return NextResponse.redirect(new URL("/game?from=landing", req.url));
  }

  // Unauthenticated users trying to access the game → send to login.
  if (!isAuthenticated && pathname.startsWith("/game")) {
    const loginUrl = new URL("/auth", req.url);
    loginUrl.searchParams.set("next", `${pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({ request: { headers: req.headers } });
}

export const config = {
  // Run on the landing page and all game routes.
  matcher: ["/", "/game/:path*"],
};
