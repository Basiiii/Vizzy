import { Footer } from '@/components/layout/footer';
import NavBar from '@/components/layout/nav-bar/nav-bar';
import { getServerUser } from '@/lib/utils/token/get-server-user';
import {
  PROFILE_PICTURE_PATH,
  SUPABASE_STORAGE_URL,
} from '@/lib/constants/storage';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userMetadata = await getServerUser();

  return (
    <>
      <NavBar
        username={userMetadata?.username || ''}
        avatarUrl={`${SUPABASE_STORAGE_URL}/${PROFILE_PICTURE_PATH}/${userMetadata?.id}`}
      />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  );
}
