// The subset of `next/server` the route handlers under src/app/api use:
// NextResponse.json/redirect/next and NextRequest#nextUrl.

export class NextResponse<Body = unknown> extends Response {
  static json<T>(body: T, init?: ResponseInit): NextResponse<T> {
    const headers = new Headers(init?.headers);
    if (!headers.has("content-type")) headers.set("content-type", "application/json");
    return new NextResponse<T>(JSON.stringify(body), { ...init, headers });
  }

  static redirect(url: string | URL, init?: number | ResponseInit): NextResponse {
    const status = typeof init === "number" ? init : (init?.status ?? 307);
    const headers = new Headers(typeof init === "object" ? init.headers : undefined);
    headers.set("location", String(url));
    return new NextResponse(null, { status, headers });
  }

  static next(): NextResponse {
    return new NextResponse(null, { status: 200 });
  }

  declare readonly __body?: Body;
}

export type NextRequest = Request & { nextUrl: URL };

export function toNextRequest(request: Request): NextRequest {
  const nextUrl = new URL(request.url);
  Object.defineProperty(request, "nextUrl", { value: nextUrl, enumerable: false });
  return request as NextRequest;
}
