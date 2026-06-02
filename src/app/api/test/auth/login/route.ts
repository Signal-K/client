import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  if (process.env.E2E_TEST_AUTH_ENABLED !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { email, password } = await request.json();
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Missing Supabase environment" }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return response;
}
