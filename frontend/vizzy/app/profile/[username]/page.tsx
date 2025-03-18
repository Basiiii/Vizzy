import type { Metadata } from 'next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserListings from './components/user-listings';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata(props: ProfilePageProps): Promise<Metadata> {
  const params = await props.params;
  const username = params.username;

  return {
    title: `${username}'s Profile | Marketplace`,
    description: `View ${username}'s profile and listings`,
  };
}

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params;
  const { username } = params;

  // TODO: Fetch data
  const user = {
    name: username,
    location: 'San Francisco, CA',
    avatarUrl: '/placeholder.svg?height=128&width=128',
    isVerified: true,
    memberSince: 2021,
    activeListings: 24,
    totalSales: 243,
  };

  // TODO: Check current user
  const isCurrentUser = username === 'johndoe'; // TODO: Replace with actual auth logic

  return (
    <main className="container mx-auto py-20 max-w-10/12">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex flex-col items-center md:flex-row md:items-center gap-6">
          <Avatar className="h-32 w-32">
            <AvatarImage src={user.avatarUrl} alt={`${user.name}'s avatar`} />
            <AvatarFallback>
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {isCurrentUser && (
                <Button variant="outline" size="sm" className="md:ml-auto">
                  Edit Profile
                </Button>
              )}
              {/* TODO: se não for o utilizador atual, mostrar botão de bloquear/desbloquear */}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              <span>{user.location}</span>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {user.isVerified && (
                <Badge variant="secondary">Verified Seller</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 text-center gap-0 h-24 flex items-center justify-center">
          <div className="text-2xl font-bold">{user.activeListings}</div>
          <div className="text-sm text-muted-foreground">Active Listings</div>
        </Card>
        <Card className="p-4 text-center gap-0 h-24 flex items-center justify-center">
          <div className="text-2xl font-bold">{user.totalSales}</div>
          <div className="text-sm text-muted-foreground">Total Sales</div>
        </Card>
        <Card className="p-4 text-center gap-0 h-24 flex items-center justify-center">
          <div className="text-2xl font-bold">{user.memberSince}</div>
          <div className="text-sm text-muted-foreground">Member Since</div>
        </Card>
      </div>

      {/* Listings Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Active Listings</h2>
        <UserListings />
      </section>
    </main>
  );
}
