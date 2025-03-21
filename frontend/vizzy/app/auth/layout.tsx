export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        {/* TODO: move duplicated parts (left side) into auth layout? */}
        <main>{children}</main>
      </div>
    </div>
  );
}
