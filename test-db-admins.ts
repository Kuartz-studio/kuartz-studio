import { db } from "./src/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const admins = await db.select().from(users).where(eq(users.role, "admin"));
  console.log(JSON.stringify(admins, null, 2));
}

main();
