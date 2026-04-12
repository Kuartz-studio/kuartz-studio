"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { AdminLoginGate, type AdminProfile } from "@/components/auth/AdminLoginGate";

export function AdminLoginWrapper({ admins }: { admins: AdminProfile[] }) {
  const [state, action, isPending] = useActionState(loginAction, {});

  return (
    <AdminLoginGate 
      admins={admins} 
      formAction={action} 
      formState={state} 
      isPending={isPending} 
    />
  );
}
