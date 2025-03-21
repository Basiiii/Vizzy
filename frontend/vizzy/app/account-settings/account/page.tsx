'use client';

//import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileLayout } from '@/app/account-settings/components/layout';
//import { createClient } from '@/utils/supabase/client';
import { DeleteAccountButton } from './components/delete-account-button';
import { getMeFE } from '../utils/get-me';
//import { useEffect, useState } from 'react';
import { UserData, Contact } from '@/types/user';
import { ContactsSection } from './components/contacts-section';
import { ROUTES } from '@/constants/routes';
//import NavBar from '@/components/ui/nav-bar';

//const supabase = await createClient();
const user: UserData = await getMeFE();

/* const mockContacts = [
  { id: '1', value: '+351 999 999 999' },
  { id: '2', value: '+351 999 999 999' },
]; */

export default function AccountSettingsPage() {
  return (
    <ProfileLayout>
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
              defaultValue={user.email}
            />
          </div>
          {/* Contacts Section */}
          <ContactsSection initialContacts={user.contacts} />
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="space-y-1">
              <Button asChild>
                <Link href={ROUTES.CHANGE_PASSWORD}>Change Password</Link>
              </Button>
            </div>
            <DeleteAccountButton />
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
