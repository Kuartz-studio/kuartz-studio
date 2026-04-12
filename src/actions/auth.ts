"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createSession, deleteSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/crypto";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  pin: z.string().optional(),
});

export type AuthState = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function loginAction(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const data = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(data);
  
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  
  const { email, pin } = parsed.data;
  
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user) {
    return { error: "Aucun compte trouvé avec cet email" };
  }
  
  // Les clients ("customer") se connectent sans mot de passe
  if (user.role === "customer") {
    await createSession(user.id, user.role);
    return { success: true, redirectTo: "/portal" };
  }
  
  // Les admins et salariés nécessitent un code PIN (digicode)
  if (!pin) {
    return { fieldErrors: { pin: ["Un digicode (6 chiffres) est requis."] } };
  }

  if (!user.passwordHash || !verifyPassword(pin, user.passwordHash)) {
    return { error: "Code PIN incorrect" };
  }
  
  await createSession(user.id, user.role);
  return { success: true, redirectTo: "/tasks" };
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
