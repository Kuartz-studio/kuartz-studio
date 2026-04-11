import { verifySession } from "@/lib/auth/session";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  // Check if an admin is viewing — we pass this info down but don't block access
  const session = await verifySession();
  const isAdmin = session?.role === "admin" || session?.role === "employee";

  return (
    <div className="min-h-screen bg-background">
      {isAdmin && (
        <div className="bg-primary text-primary-foreground text-center text-xs py-1.5 font-medium tracking-wide">
          👁️ Vue client (Admin)
        </div>
      )}
      <main>
        {children}
      </main>
    </div>
  );
}
