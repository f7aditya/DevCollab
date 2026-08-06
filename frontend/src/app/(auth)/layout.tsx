import * as React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">{children}</div>
    </div>
  );
}
