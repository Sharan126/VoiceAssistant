"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { authService } from "@/services/auth-service";
import { signupSchema, type SignupInput } from "@/types/auth.types";
import { toast } from "sonner";
import { Loader2, Lock, Mail, User } from "lucide-react";

export function SignupForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<SignupInput>({
    email: "",
    password: "",
    fullName: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupInput, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof SignupInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = signupSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof SignupInput, string>> = {};
      for (const issue of validation.error.issues) {
        const path = issue.path[0] as keyof SignupInput;
        if (path) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.signUpWithPassword(validation.data);

      if (!result.success) {
        toast.error(result.error ?? "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      if (result.data?.session) {
        toast.success("Account created successfully! Welcome to Aura Voice.");
        router.push("/app");
        router.refresh();
      } else {
        toast.success("Account created! Please check your email to confirm your account before logging in.");
        router.push("/login");
      }
    } catch {
      toast.error("An unexpected error occurred during signup.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create an Account</h1>
        <p className="text-sm text-muted-foreground">
          Start interacting with next-generation AI voice intelligence
        </p>
      </div>

      <OAuthButtons isLoading={isLoading} />

      <div className="relative flex items-center justify-center">
        <Separator className="w-full" />
        <span className="absolute bg-card px-2 text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Or register with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Alex Smith"
              autoComplete="name"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isLoading}
              className="pl-9"
            />
          </div>
          {errors.fullName && (
            <p className="text-xs font-medium text-destructive">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="pl-9"
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min 8 characters"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="pl-9"
            />
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-destructive">{errors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="gradient"
          className="w-full font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
