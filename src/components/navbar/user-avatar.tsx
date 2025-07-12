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
import { Avatar, AvatarImage } from "@/components/ui/avatar";

import { signOut } from "next-auth/react";

interface UserAvatarProps {
  image: string | null;
  email?: string;
}

export default function UserAvatar({ image, email }: UserAvatarProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="focus:border-none focus:ring-0 focus-visible:ring-0"
      >
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <Avatar className="h-8 w-8 relative overflow-hidden">
            <AvatarImage
              src={
                image
                  ? image
                  : "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png"
              }
              alt={"User Avatar"}
              className="border-2 border-primary object-cover rounded-full"
            />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="data-[state=closed]:slide-out-to-left-0 data-[state=open]:slide-in-from-left-0 data-[state=closed]:slide-out-to-bottom-20 data-[state=open]:slide-in-from-bottom-20 data-[state=closed]:zoom-out-100 w-56 duration-400"
      >
        <DropdownMenuLabel>{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
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
  );
}
