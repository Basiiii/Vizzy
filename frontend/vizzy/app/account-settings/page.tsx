import NavBar from '@/components/layout/nav-bar';
import { Footer } from '@/components/layout/footer';

export default function ProfilePage() {
  return (
    <>
      <NavBar username={''} avatarUrl={''} />
      <div className="flex flex-col w-full min-h-screen">
        <main className="flex-1"></main>
      </div>
      <Footer />
    </>
  );
}
