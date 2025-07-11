"use client";

import Image from "next/image";

import PackageColumnActions from "@/components/tables/actions/package-column-actions";

import { formatPrice } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";

export type PackageTable = {
  id: string;
  image: string;
  name: string;
  price: number;
  sold: number;
  onDelete?: (id: string) => void;
};

export const columns: ColumnDef<PackageTable>[] = [
  {
    accessorKey: "id",
    header: "ID Paket",
  },
  {
    accessorKey: "image",
    header: "Gambar",
    cell: ({ row }) => {
      return (
        <Image
          src={row.original.image}
          alt={row.original.name}
          className="h-10 w-10 rounde-md object-cover"
        />
      );
    },
  },
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "price",
    header: "Harga",
    cell: ({ row }) => {
      return (
        <span className="font-semibold">{formatPrice(row.original.price)}</span>
      );
    },
  },
  {
    accessorKey: "sold",
    header: "Terjual",
  },
  {
    id: "actions",
    cell: ({ row }) => <PackageColumnActions id={row.original.id} />,
  },
];
