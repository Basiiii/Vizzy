'use client';

//import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileLayout } from '@/app/account-settings/components/layout';
import { createClient } from '@/utils/supabase/client';
//import NavBar from '@/components/ui/nav-bar';

const supabase = await createClient();
const user = await supabase.auth.getSession();

export default function AccountSettingsPage() {
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
              defaultValue={user.data.session?.user.email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value="********" disabled />
            <div className="space-y-1">
              <Button asChild>
                <Link href="/auth/change-password">Change Password</Link>
              </Button>
            </div>
          </div>

          {/*      <div className="space-y-2">
            <div className="flex items-center justify-left spaxe-x-2">
              <Label htmlFor="notifications">Notifications</Label>
              <Switch id="notifications" defaultChecked />
            </div>
            <p className="text-sm text-muted-foreground">
              Allow email notifications.
            </p>
          </div> */}
        </div>

        <Button type="submit" className="w-full sm:w-auto">
          Saves changes
        </Button>
      </form>
    </ProfileLayout>
  );
}
