import React from "react";

type AuthLayoutProps = {
  children?: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="max-w-md w-full mx-auto">{children}</div>
    </div>
  );
}
