import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/tables/columns/user-columns";

import { getAllUserTable } from "@/actions/user";

const DashboardServicePage = async () => {
  const users = await getAllUserTable();

  return (
    <div className="flex-1 space-y-4 py-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Daftar Pengguna</h2>
        <p className="text-muted-foreground">
          Lihat dan kelola semua pengguna yang terdaftar di sistem.
        </p>
      </div>
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Cari nama pengguna..."
      />
    </div>
  );
};

export default DashboardServicePage;
