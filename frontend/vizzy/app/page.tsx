import { Footer } from '@/components/layout/footer';
import NavBar from '@/components/layout/nav-bar/nav-bar';
import Marketplace from '@/components/marketplace/marketplace';

export default function Home() {
  return (
    <main>
      <NavBar username={''} avatarUrl={''} />
      <div className="pt-12">
        <Marketplace />
      </div>
      <Footer />
    </main>
  );
}
