import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import OffchainAccount from '../../components/Data/OffchainAccount';

const OffChainAuthHome = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
    
    return (
        <div className='container' style={{ padding: '50px 0 100px 0' }}>
            {!session ? (
                <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa}} theme='dark' />
            ) : (
                <OffchainAccount session={session} />
            )}
        </div>
    );
}

export default OffChainAuthHome;