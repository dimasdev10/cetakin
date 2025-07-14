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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/password-input";
import { AuthWrapper } from "@/components/form/auth-wrapper";

import { toast } from "sonner";
import { signIn } from "@/actions/auth";
import { useForm } from "react-hook-form";
import { Loader2, Lock, Mail } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInSchema } from "@/lib/validations/auth";

const SigninForm = () => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignInSchema) => {
    startTransition(async () => {
      signIn(data).then((data) => {
        if (data?.error) {
          return toast.error(data.error);
        }
        if (data?.success) {
          form.reset();
          return toast.success(data.success);
        }
      });
    });
  };

  return (
    <AuthWrapper
      title="Masuk"
      description="Masuk ke dalam akun anda untuk melanjutkan"
      backButtonLink="/auth/sign-up"
      backButton="Belum memiliki akun? Daftar"
    >
      <Form {...form}>
        <form action="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-3 flex flex-col">
            <div className="space-y-3 flex flex-col">
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
              Masuk
              <span className="sr-only">masuk kedalam akun</span>
            </Button>
          </div>
        </form>
      </Form>
    </AuthWrapper>
  );
};

export default SigninForm;
