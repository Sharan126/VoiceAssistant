import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to access your AI Voice Assistant workspace.",
};

export default function LoginPage() {
  return (
    <AuthCard>
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
