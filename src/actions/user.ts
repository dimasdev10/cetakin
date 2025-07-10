"use server";

import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";
import { getCurrentUser } from "./current-user";

export default async function getAllUsers(): Promise<User[]> {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Unauthorized access");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
    },
  });

  const;
}
