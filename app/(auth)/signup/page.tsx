import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a new AI Voice Assistant account.",
};

export default function SignupPage() {
  return (
    <AuthCard>
      <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading signup...</div>}>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
