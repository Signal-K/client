'use client';

import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function OnlineUserList() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [onlineUsers, setOnlineUsers] = useState(0);

    useEffect(() => {
        const roomOne = supabase.channel('room_01', {
            config: {
                presence: {
                    key: session?.user.id || '',
                },
            },
        });

        roomOne
            .on('presence', { event: 'sync' }, () => {
                const currentPresenceState = roomOne.presenceState();
                // Update the onlineUsers state with the number of currently online users
                const onlineUsersCount = Object.keys(currentPresenceState).length;
                setOnlineUsers(onlineUsersCount);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log('User joined:', key, newPresences);
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                console.log('User left:', key, leftPresences);
            })
            .subscribe();

        // Clean up the subscription on unmount
        return () => {
            roomOne.unsubscribe();
        };
    }, [supabase]);

    return (
        <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
            <h1 className='text-sm text-gray-400'>{onlineUsers} Online</h1>
        </div>
    );
};