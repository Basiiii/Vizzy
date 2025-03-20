import { getServerUser } from '@/utils/token/get-server-user';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const userProfile = await getServerUser();

  if (userProfile == null) {
    redirect(`/auth/login`);
  } else {
    redirect(`/profile/${userProfile.username}`);
  }
}
