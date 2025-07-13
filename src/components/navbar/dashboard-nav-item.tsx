"use client";

import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

interface NavbarItemProps {
  image?: string;
  name: string;
  email: string;
}

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Pelanggan", path: "/dashboard/users" },
  { name: "Paket", path: "/dashboard/packages" },
  { name: "Pesanan", path: "/dashboard/orders" },
];

export default function DashboardNavItem({
  image,
  name,
  email,
}: NavbarItemProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="flex items-center gap-8">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          href={link.path}
          className={cn(
            "text-sm transition-colors text-secondary-foreground/80 hover:text-primary cursor-pointer",
            isActive(link.path) && "text-primary bg-transparent"
          )}
        >
          {link.name}
        </Link>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="focus:border-none focus:ring-0 focus-visible:ring-0"
        >
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 hover:bg-transparent cursor-pointer"
          >
            <Avatar className="h-8 w-8 relative overflow-hidden">
              <AvatarImage
                src={
                  image
                    ? image
                    : "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                }
                alt={name}
                className="border-2 border-primary object-cover rounded-full"
              />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-primary">{name}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-bottom-20 data-[state=open]:slide-in-from-bottom-20 data-[state=closed]:zoom-out-100 w-56 duration-400">
          <DropdownMenuLabel>{email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={"/profile"}>Profil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer"
            >
              Keluar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
