import Link from "next/link";
import Image from "next/image";

import MobileSidebar from "@/components/navbar/mobile-sidebar";
import { LandingNavItem } from "@/components/navbar/landing-nav-item";

import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/actions/current-user";
import UserAvatar from "./user-avatar";

export async function LandingNavbar() {
  const user = await getCurrentUser();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b-1 border-dashed bg-background/60 backdrop-blur-[8px] px-4 md:px-14"
      )}
    >
      <div className="py-4 flex items-center justify-between border-r border-l border-dashed px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative rounded-md h-10 w-10 shadow overflow-hidden">
            <Image
              src="/logo-wm.png"
              alt="SneakCare Logo"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xl font-bold text-secondary-foreground/90 tracking-widest hidden md:block">
            W&M.
          </span>
        </Link>

        <div className="hidden md:block">
          <LandingNavItem user={user!} />
        </div>

        <div className="md:hidden flex items-center gap-4">
          {user ? (
            <UserAvatar image={user.image!} email={user.email!} />
          ) : (
            <Link href="/auth/login">
              <button className="px-4 py-2 text-sm font-semibold text-primary bg-secondary rounded-md hover:bg-secondary/80 transition-colors">
                Masuk
              </button>
            </Link>
          )}
          <MobileSidebar user={user!} />
        </div>
      </div>
    </header>
  );
}
