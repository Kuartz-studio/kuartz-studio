import { z } from "zod";

/** Shared Zod schema for base64 image data URLs (avatars & logos). */
export const base64ImageSchema = z
  .string()
  .startsWith("data:image/", { message: "L'image doit être une data URL valide" })
  .max(150_000, { message: "L'image est trop volumineuse (150 KB max)" });
