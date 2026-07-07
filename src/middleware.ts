import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isHomeRoute = createRouteMatcher(["/"]);
const isGameRoute = createRouteMatcher(["/game(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const { pathname } = request.nextUrl;

  if (userId && isHomeRoute(request)) {
    return NextResponse.redirect(new URL("/game?from=landing", request.url));
  }

  if (!userId && isGameRoute(request)) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/game/:path*", "/api/:path*"],
};
