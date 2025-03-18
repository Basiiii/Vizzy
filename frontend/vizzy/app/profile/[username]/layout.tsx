import { Footer } from '@/components/layout/footer';
import NavBar from '@/components/layout/nav-bar';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar userName={''} avatarUrl={''} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
