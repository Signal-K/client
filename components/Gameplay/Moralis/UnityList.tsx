import { getSession } from 'next-auth/react';
import { Session } from '@supabase/supabase-js';
import { useState } from 'react';

function MoralisList ({ user, nftItems, }) {
    const [dataS, setDataS] = useState(nftItems);
}