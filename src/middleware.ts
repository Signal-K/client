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
  if (!hasSupabaseAuthCookie(req) && req.nextUrl.pathname.startsWith("/game")) {
    const loginUrl = new URL("/auth", req.url);
    const nextPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({ request: { headers: req.headers } });
}

export const config = {
  matcher: ["/game/:path*"],
};
