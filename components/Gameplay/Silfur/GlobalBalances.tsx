import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface User {
    id: number;
    name: string;
    balance: number;
};

interface Credits {
    user_id: string;
    amount: number;
}

const UserBalanceTable: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const supabase = useSupabaseClient();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data: credits, error } = await supabase.from('credits').select('user_id, amount');
            if (error) { throw new Error(error.message); };

            // Fetch user profiles
            const { data: profiles } = await supabase.from('profiles').select('id, username');

            // Merge the credits & profile data together
            const users: User[] = credits.map((credit) => {
                const profile = profiles.find((profile) => profile.id === credit.user_id)
                return {
                    id: credit.user_id,
                    name: profile?.username || 'Unknown',
                    balance: credit.amount,
                };
            });

            setUsers(users || []);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
}

export default UserBalanceTable;