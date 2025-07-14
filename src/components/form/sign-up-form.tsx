"use client";

import { useTransition } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { PasswordInput } from "@/components/password-input";

import { toast } from "sonner";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { signUp } from "@/actions/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpSchema } from "@/lib/validations/auth";
import { AuthWrapper } from "./auth-wrapper";
import { Button } from "../ui/button";

const SignupForm = () => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignUpSchema) => {
    startTransition(async () => {
      signUp(data).then((data) => {
        if (data?.error) {
          return toast.error(data.error);
        }
        if (data?.success) {
          form.reset();
          return toast.success(data.success, {
            action: {
              label: "Masuk",
              onClick: () => {
                window.location.href = "/auth/sign-in";
              },
            },
            actionButtonStyle: {
              backgroundColor: "#16a34a",
              color: "#fff",
            },
          });
        }
      });
    });
  };

  return (
    <AuthWrapper
      title="Daftar Akun"
      description="Daftar akun baru untuk menggunakan layanan kami."
      backButtonLink="/auth/sign-in"
      backButton="Sudah memiliki akun? Masuk"
    >
      <Form {...form}>
        <form action="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-3 flex flex-col">
            <div className="space-y-3 flex flex-col">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                          <User className="size-4" aria-hidden="true" />
                        </span>
                        <Input
                          {...field}
                          type="text"
                          disabled={isPending}
                          className="border-primary pl-10 h-10"
                          placeholder="Masukkan nama lengkap anda"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                          <Mail className="size-4" aria-hidden="true" />
                        </span>
                        <Input
                          {...field}
                          type="email"
                          disabled={isPending}
                          className="border-primary pl-10 h-10"
                          placeholder="Masukkan email anda"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                          <Lock className="size-4" aria-hidden="true" />
                        </span>
                        <PasswordInput
                          {...field}
                          disabled={isPending}
                          className="border-primary pl-10 h-10"
                          placeholder="Masukkan password anda"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              className="flex items-center justify-center mt-2 border border-y-0"
              disabled={isPending}
            >
              {isPending && (
                <Loader2
                  className="mr-2 size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Buat Akun
              <span className="sr-only">buat akun</span>
            </Button>
          </div>
        </form>
      </Form>
    </AuthWrapper>
  );
};

export default SignupForm;
