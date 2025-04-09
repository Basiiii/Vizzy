import { Footer } from '@/components/layout/footer';
import NavBar from '@/components/layout/nav-bar/nav-bar';
import Marketplace from '@/components/marketplace/marketplace';
import { getServerUser } from '@/lib/utils/token/get-server-user';

export default async function Home() {
  const userMetadata = await getServerUser();

  return (
    <main>
      <NavBar username={userMetadata?.username || ''} avatarUrl={''} />
      <div className="pt-12">
        <Marketplace />
      </div>
      <Footer />
    </main>
  );
}
