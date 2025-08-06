import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            profileId,
            subscription
        } = body;
        
        const {
            endpoint,
            keys
        } = subscription;

        console.log('Received subscription request:', { profileId, endpoint: endpoint?.substring(0, 50) + '...', hasAuth: !!keys?.auth, hasP256dh: !!keys?.p256dh });

        if (!profileId || !endpoint || !keys?.auth || !keys?.p256dh) {
            console.log('Missing fields:', { profileId: !!profileId, endpoint: !!endpoint, auth: !!keys?.auth, p256dh: !!keys?.p256dh });
            return NextResponse.json({
                error: "Missing fields",
            }, {
                status: 400
            });
        }

        const supabase = createRouteHandlerClient({ cookies });

        console.log('Inserting push subscription...');
        
        const {
            error
        } = await supabase
            .from("push_subscriptions")
            .insert({
                profile_id: profileId,
                endpoint,
                auth: keys.auth,
                p256dh: keys.p256dh,
            });

    if (error) {
        console.error('Push subscription upsert error:', error);
        return NextResponse.json({
            error: error.message,
        }, {
            status: 500
        });
    };

    console.log('Push subscription saved successfully');
    return NextResponse.json({
        success: true
    });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
};