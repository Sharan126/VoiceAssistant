"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth-service";
import { getInitials } from "@/utils/formatters";
import type { Profile } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { LogOut, Settings, User as UserIcon } from "lucide-react";

interface UserNavProps {
  user: User;
  profile: Profile | null;
  onOpenSettings?: () => void;
}

export function UserNav({ user, profile, onOpenSettings }: UserNavProps) {
  const router = useRouter();
  const displayName = profile?.full_name ?? user.user_metadata?.["full_name"] ?? user.email ?? "User";
  const initials = getInitials(profile?.full_name ?? user.user_metadata?.["full_name"], user.email);

  const handleSignOut = async () => {
    try {
      const res = await authService.signOut();
      if (!res.success) {
        toast.error(res.error ?? "Failed to sign out");
        return;
      }
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("An error occurred during sign out");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-1 ring-border hover:ring-primary/40">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url ?? user.user_metadata?.["avatar_url"]} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground truncate">
              {displayName}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/app")} className="cursor-pointer">
          <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Workspace</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onOpenSettings?.()}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
