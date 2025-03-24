import { Footer } from '@/components/layout/footer';
import NavBar from '@/components/layout/nav-bar';
import { getServerUser } from '@/lib/utils/token/get-server-user';

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userMetadata = await getServerUser();

  return (
    <>
      <NavBar username={userMetadata?.username || ''} avatarUrl={''} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
