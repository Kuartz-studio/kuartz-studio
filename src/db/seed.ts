import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import { hashPassword } from "../lib/auth/crypto";

const seed = async () => {
  // Le digicode par défaut pour les tests est "000000"
  const defaultPin = "000000";
  const pinHash = hashPassword(defaultPin);

  const predefinedAccounts = [
    { name: "Andrea Gauvreau", email: "andrea@kuartz.studio", passwordHash: pinHash, role: "admin" as const },
    { name: "Anas", email: "anas@kuartz.studio", passwordHash: pinHash, role: "admin" as const },
    { name: "Mehdi", email: "mehdi@kuartz.studio", passwordHash: pinHash, role: "admin" as const },
    { name: "Client Test", email: "client@test.com", passwordHash: null, role: "customer" as const },
  ];

  console.log("Seeding accounts...");
  for (const account of predefinedAccounts) {
    try {
      await db.insert(users).values(account).onConflictDoNothing({ target: users.email });
      console.log(`Created ${account.email}`);
    } catch (e) {
      console.log(`Skipped ${account.email}`);
    }
  }
  console.log("Seeding done.");
};

seed().catch(console.error);
