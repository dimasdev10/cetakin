import { PackageWithFields } from "@/types/package";
import type { User, Order, OrderFile } from "@prisma/client";

export type OrderWithDetails = Order & {
  user: User;
  package: PackageWithFields;
  files: OrderFile[];
};
