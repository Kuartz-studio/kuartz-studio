import { z } from "zod";

export const insertProjectSchema = z.object({
  name: z.string().min(2, "Le nom est trop court").max(100, "Le nom est trop long"),
  slug: z.string().min(2, "Le slug est trop court").max(100, "Le slug est trop long").regex(/^[a-z0-9-]+$/, "Lettres minuscules, chiffres et tirets uniquement").optional(),
  description: z.string().optional(),
});
