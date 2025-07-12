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

import { signOut } from "@/lib/auth";
import { ExtendedSession } from "@/types/next-auth";

interface NavbarItemProps {
  user: ExtendedSession;
}

const navLinks = [
  { name: "Home", path: "/#home" },
  { name: "Fitur", path: "/#features" },
  { name: "Paket", path: "/#packages" },
  { name: "Lokasi", path: "/#location" },
];

export function LandingNavItem({ user }: NavbarItemProps) {
  return (
    <nav className="flex items-center gap-8">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          href={link.path}
          className="text-sm transition-colors text-secondary-foreground/80 hover:text-secondary-foreground"
        >
          {link.name}
        </Link>
      ))}
      {user.role === "ADMIN" && (
        <Button asChild size="sm" className="ml-4">
          <Link href="/dashboard/users">Dashboard</Link>
        </Button>
      )}
      {user.id ? (
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
                    user.image
                      ? user.image
                      : "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
                  }
                  alt={user.name!}
                  className="border-2 border-primary object-cover rounded-full"
                />
                <AvatarFallback>{user.name!.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-primary">
                {user.name}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-bottom-20 data-[state=open]:slide-in-from-bottom-20 data-[state=closed]:zoom-out-100 w-56 duration-400">
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={"/dashboard/profile"}>Profil</Link>
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
      ) : (
        <Button asChild size="sm" className="ml-4">
          <Link href="/auth/signin">Masuk</Link>
        </Button>
      )}
    </nav>
  );
}
