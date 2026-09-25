export type RouteHandler = (
  request: Request,
  context: { params: Promise<Record<string, string | string[]>> },
) => Response | Promise<Response>;

export type RouteModule = Partial<Record<"GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS", RouteHandler>>;
