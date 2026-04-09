import { verifySession } from "@/lib/auth/session";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await verifySession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-4">
      <h1 className="text-4xl font-bold">Dashboard Admin</h1>
      <p>Bienvenue ! Votre session est active et protégée.</p>
      
      <div className="p-4 bg-muted rounded-md text-sm font-mono overflow-auto w-full max-w-md">
        {JSON.stringify(session, null, 2)}
      </div>
      
      <form action={logoutAction} className="mt-4">
        <Button variant="destructive" type="submit">Se déconnecter</Button>
      </form>
    </div>
  );
}
