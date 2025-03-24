import { ROUTES } from '@/lib/constants/routes/routes';
import { getServerUser } from '@/lib/utils/token/get-server-user';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const userProfile = await getServerUser();

  if (userProfile == null) {
    redirect(ROUTES.LOGIN);
  } else {
    redirect(`${ROUTES.PROFILE}${userProfile.username}`);
  }
}
