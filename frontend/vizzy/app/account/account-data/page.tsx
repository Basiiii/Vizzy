'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileLayout } from '@/components/account-settings/account-settings-layout';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { UUID } from 'crypto';
import { useSearchParams } from 'next/navigation';
//import { createClient } from '@/utils/supabase/client';

export const metadata: Metadata = {
  title: 'Account Setings',
  description: 'Change your account settings!',
};

//export async function getServerSideProps(context) {
//const { id } = context.params;
//const res = await fetch(`http://localhost:3000/users/${id}`, {
//method: 'GET',
//credentials: 'include',
//});
//const user = await res.json();

//return {
// props: { user },
//};
//}

interface User {
  id: UUID;
  name: string;
  email: string;
  username: string;
}

export default function AccountSettingsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(`/api/user?userId=${userId}`); // Substitua pelo ID real do usuário

        if (!response.ok) {
          throw new Error('Error fetching user');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown Error');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <ProfileLayout currentPath="/settings/account">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings.
        </p>
      </div>

      <form className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email Address"
              defaultValue={user?.email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value="********" disabled />
            <Button asChild>
              <Link href="/auth/change-password">Change Password</Link>
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notifications</Label>
              <Switch id="notifications" defaultChecked />
            </div>
            <p className="text-sm text-muted-foreground">
              Allow email notifications.
            </p>
          </div>
        </div>

        <Button type="submit" className="w-full sm:w-auto">
          Saves changes
        </Button>
      </form>
    </ProfileLayout>
  );
}
