import { NextApiRequest, NextApiResponse } from "next";
import { verifyLogin } from '@thirdweb-dev/auth/evm';
import { createSupabaseServer } from "../../lib/createSupabaseAdmin";

export default async ( req: NextApiRequest, res: NextApiResponse ) => {
    const { payload, access_token } = req.body;
    const supabase = createSupabaseServer(); // Use supabase service role to access the database

    // Get the user from database using client-side access token
    const {
        data: { user },
    } = await supabase.auth.getUser(access_token);

    // Verify the validity of the signed login payload
}