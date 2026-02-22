import { createSupabaseServerClient } from "@/lib/supabase/ssr";

export async function getRouteSupabaseWithUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    supabase,
    user,
    authError: error,
  };
}

export async function getRouteUser() {
  const { user, authError } = await getRouteSupabaseWithUser();
  return { user, authError };
}
