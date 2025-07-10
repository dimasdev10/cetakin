import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

export type ExtendedSession = DefaultSession["user"] & {
  role: UserRole;
  address?: string | null;
  phone?: string | null;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedSession;
  }
}
