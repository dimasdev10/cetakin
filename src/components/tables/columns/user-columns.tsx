"use client";

import { ColumnDef } from "@tanstack/react-table";

import UserColumActions from "@/components/tables/actions/user-column-actions";

export type UserTable = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  onDelete?: (idService: string) => void;
};

export const columns: ColumnDef<UserTable>[] = [
  {
    accessorKey: "id",
    header: "ID Pelanggan",
  },
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "createdAt",
    header: "Terdaftar",
  },
  {
    id: "actions",
    cell: ({ row }) => <UserColumActions id={row.original.id} />,
  },
];
