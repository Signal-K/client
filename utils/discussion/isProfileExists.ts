import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

const supabase = useSupabaseClient();
const session = useSession();

interface UserProfile {
  username: string;
  website: string | null;
  avatar_url: string | null;
}

export default async function isProfileExists(): Promise<boolean> {
  try {
    const user = session?.user;

    let { data, error, status } = await supabase
      .from('profiles')
      .select(`username, website, avatar_url`)
      .eq('id', user?.id)
      .single();

    if (error) {
      return false;
    }

    return !!data; // Check if data is truthy (profile exists) or falsy (profile doesn't exist)
  } catch (error) {
    console.error(error.message);
    return false; // Handle errors gracefully and return false in case of an error
  }
}