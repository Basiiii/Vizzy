import { Footer } from '@/components/layout/footer';
import NavBar from '@/components/layout/nav-bar/nav-bar';
import Marketplace from '@/components/marketplace/marketplace';
import { getServerUser } from '@/lib/utils/token/get-server-user';
import {
  PROFILE_PICTURE_PATH,
  SUPABASE_STORAGE_URL,
} from '@/lib/constants/storage';

export default async function Home() {
  const userMetadata = await getServerUser();

  return (
    <main>
      <NavBar username={userMetadata?.username || ''} avatarUrl={`${SUPABASE_STORAGE_URL}/${PROFILE_PICTURE_PATH}/${userMetadata?.id}`} />
      <div className="pt-12">
        <Marketplace />
      </div>
      <Footer />
    </main>
  );
}
