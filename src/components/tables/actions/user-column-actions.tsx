"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { deleteUser } from "@/actions/user";
import { MoreHorizontal, Trash2, Loader2 } from "lucide-react";

interface UserColumActionsProps {
  id: string;
}

export default function UserColumActions({ id }: UserColumActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteUser(id).then((result) => {
        if (result.error) {
          toast.error(result.error);
        } else {
          router.refresh();
          toast.success(result.success);
          setOpen(false);
        }
      });
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isPending}>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="cursor-pointer text-red-500 hover:!text-red-600"
          >
            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="hidden">
            Hapus
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengguna?</DialogTitle>
            <DialogDescription>
              Apakah anda yakin ingin menghapus akun pengguna dari sistem?
              tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Batalkan
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
