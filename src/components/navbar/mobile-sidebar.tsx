import type { ForwardRefExoticComponent, RefAttributes } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  AlignRight,
  ArrowRight,
  AwardIcon,
  CircleSmallIcon,
  HomeIcon,
  MapPin,
  Package2,
  type LucideProps,
} from "lucide-react";
import Link from "next/link";
import { ExtendedSession } from "@/types/next-auth";

type NavigationItem = {
  name: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  href: string;
} & {
  children?: never;
};

const navigationMenu: NavigationItem[] = [
  {
    name: "Home",
    icon: HomeIcon,
    href: "/#home",
  },
  {
    name: "Fitur",
    icon: AwardIcon,
    href: "/#features",
  },
  {
    name: "Paket",
    icon: Package2,
    href: "/#packages",
  },
  {
    name: "Lokasi",
    icon: MapPin,
    href: "/#location",
  },
];

const NavigationMenu = ({
  item,
  level,
}: {
  level: number;
  item: NavigationItem;
}) => {
  return (
    <Link href={item.href} className="flex flex-col">
      <div
        className="focus-visible:ring-ring/50 flex items-center gap-2 rounded-md p-1 outline-none focus-visible:ring-[3px] hover:text-primary"
        style={{ paddingLeft: `${level === 0 ? 0.25 : 1.75}rem` }}
      >
        {level === 0 ? (
          <item.icon className="size-4 shrink-0" />
        ) : (
          <CircleSmallIcon className="size-4 shrink-0" />
        )}
        <span className="text-sm">{item.name}</span>
      </div>
      <Separator className="my-1" />
    </Link>
  );
};

interface MobileSidebarProps {
  user: ExtendedSession;
}

const MobileSidebar = ({ user }: MobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <AlignRight className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-75">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="p-4 pt-0">
          {user.role === "ADMIN" && (
            <Button asChild size="sm" className="w-full">
              <Link href="/dashboard/users">
                Dashboard
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-2.5 p-4 pt-0">
          {navigationMenu.map((item) => (
            <NavigationMenu key={item.name} item={item} level={0} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
