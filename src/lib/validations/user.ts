import * as z from "zod";

export const EditProfileSchema = z.object({
  name: z.optional(z.string().min(1, { message: "Name is required" })),
  image: z.optional(z.string()),
  email: z.optional(
    z.string().email({ message: "Please enter a valid email" })
  ),
  isTwoFactorEnabled: z.optional(z.boolean()),
});
