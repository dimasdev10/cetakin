import Link from "next/link";
import Image from "next/image";

import DashboardNavItem from "@/components/navbar/dashboard-nav-item";

import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/actions/current-user";

export default async function DashboardNavbar() {
  const admin = await getCurrentUser();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b-1 border-dashed bg-background/60 backdrop-blur-[8px]"
      )}
    >
      <div className="px-16 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative rounded-md h-10 w-10 shadow overflow-hidden">
            <Image
              src="/logo-wm.png"
              alt="SneakCare Logo"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xl font-bold text-secondary-foreground/90 tracking-widest">
            W&M.
          </span>
        </Link>

        <DashboardNavItem
          image={admin?.image as string}
          name={admin?.name as string}
          email={admin?.email as string}
        />
      </div>
    </header>
  );
}
