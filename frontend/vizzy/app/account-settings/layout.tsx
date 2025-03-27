import NavBar from '@/components/layout/nav-bar';
import { Footer } from '@/components/layout/footer';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar username={''} avatarUrl={''} />
      <div className="flex w-full flex-col min-h-screen">
        <main className="flex-1 w-full mx-auto p-3">{children}</main>
      </div>
      <Footer />
    </>
  );
}
