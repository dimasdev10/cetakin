"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  children: React.ReactNode;
  title: string;
  description: string;
  backButton: string;
  backButtonLink: string;
}

export const AuthWrapper = ({
  children,
  title,
  description,
  backButton,
  backButtonLink,
}: Props) => {
  return (
    <Card className="w-full max-w-lg bg-transparent shadow-none border-none">
      <CardHeader>
        <Link
          href="/"
          className="relative w-16 h-16 rounded-xl overflow-hidden mx-auto mb-4 shadow-md"
        >
          <Image src="/logo-wm.png" alt="Logo" fill className="object-cover" />
        </Link>
        <CardTitle className="md:text-lg xl:text-xl text-primary text-center">
          {title}
        </CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent h-[1px] w-full" />
          <Link prefetch={false} href={backButtonLink}>
            {backButton}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
