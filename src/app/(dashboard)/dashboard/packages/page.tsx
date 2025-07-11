import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/tables/columns/package-columns";

import { getAllPackageTable } from "@/actions/package";
import { Plus } from "lucide-react";

const DashboardPackagesPage = async () => {
  const packages = await getAllPackageTable();

  return (
    <div className="flex-1 space-y-4 py-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Daftar Paket</h2>
        <p className="text-muted-foreground">
          Lihat dan kelola semua paket yang tersedia.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={packages}
        searchKey="name"
        searchPlaceholder="Cari nama paket..."
      >
        <Button asChild className="cursor-pointer">
          <Link href="/dashboard/packages/create">
            <Plus className="h-4 w-4" />
            Tambah Paket
          </Link>
        </Button>
      </DataTable>
    </div>
  );
};

export default DashboardPackagesPage;
