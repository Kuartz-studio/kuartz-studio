import { verifySession } from "@/lib/auth/session";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  // Check if an admin is viewing — we pass this info down but don't block access
  const session = await verifySession();
  const isAdmin = session?.role === "admin" || session?.role === "employee";

  return (
    <div className="min-h-screen bg-background">

      <main>
        {children}
      </main>
    </div>
  );
}
