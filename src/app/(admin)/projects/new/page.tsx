import { db } from "@/db";
import { users } from "@/db/schema";
import { NewProjectForm } from "@/components/projects/NewProjectForm";

export default async function NewProjectPage() {
  const allUsers = await db.select({ id: users.id, name: users.name, role: users.role, avatarBase64: users.avatarBase64 }).from(users);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <NewProjectForm users={allUsers} />
    </div>
  );
}

