import { useAddress, useMetamask, useAuth, useConnect } from '@thirdweb-dev/react';
import { createSupabaseClient } from '../../lib/createSupabase';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import useSupabaseUser from '../../lib/useSupabaseUser';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

export default function ThirdwebLogin () {
    const address = useAddress();
    const connect = useMetamask();
    const thirdwebAuth = useAuth();
    const { auth } = createSupabaseClient();
    const { user, refresh } = useSupabaseUser();

    // Legacy supabase contents
    const session = useSession();
    const supabase = useSupabaseClient();
  
    // Link verified wallet address to our Supabase account
    async function linkWallet() {
      const payload = await thirdwebAuth?.login();
      await fetch("/api/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload, access_token: session?.access_token }),
      });
      refresh();
      // Save the wallet address like in pages/generator/account.tsx and then upsert it
    }
  
    return (
      <div>
        {!session ? (
            <><Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa}} theme='dark' />
            {/*<button
                onClick={() =>
                    auth.signInWithOAuth({
                        provider: "google",
                    })
                }
            >
                Login with Google
            </button>*/}
        </>
        ) : !address ? (
          <button onClick={connect}>Connect Wallet</button>
        ) : (
          <button onClick={linkWallet}>Connect Wallet</button>
        )}
  
        <p>User {user?.user_metadata.address}</p>
      </div>
    );
  }