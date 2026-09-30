// Browser side of /api/actions/[name] (SSC-31). Keeps the old server-action
// call shape: resolve with the action's return value, reject with its error
// message. A lone FormData argument is sent as multipart so file uploads work.
export const FORM_DATA_ARGS_HEADER = "x-action-args";

export async function callAction<T>(name: string, args: unknown[]): Promise<T> {
  const init: RequestInit = { method: "POST", credentials: "same-origin" };

  if (args.length === 1 && typeof FormData !== "undefined" && args[0] instanceof FormData) {
    init.body = args[0];
    init.headers = { [FORM_DATA_ARGS_HEADER]: "form-data" };
  } else {
    init.body = JSON.stringify({ args });
    init.headers = { "content-type": "application/json" };
  }

  const response = await fetch(`/api/actions/${encodeURIComponent(name)}`, init);
  const payload = (await response.json().catch(() => null)) as
    | { result?: T; error?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error || `Action ${name} failed (${response.status})`);
  }

  return payload?.result as T;
}
