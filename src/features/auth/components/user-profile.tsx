"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "./auth-provider";
import { toast } from "@/components/ui/toast";
import { useState } from "react";

interface UserProfileDropdownProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserProfileDropdown({ user: propUser }: UserProfileDropdownProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : "U";
  };

  const handleSignOut = async () => {
    const logoutAction = async () => {
      const res = await authClient.signOut({});

      if (res.error) {
        throw new Error(res.error.message || "Gagal logout. Silakan coba lagi.");
      }

      return res.data;
    };

    toast.promise(logoutAction(), {
      loading: "Memproses logout...",
      success: () => {
        setIsLoading(false);
        router.push("/login");
        window.location.reload();

        return "Logout Berhasil! Mengalihkan...";
      },
      error: (err: Error) => {
        setIsLoading(false);
        return err.message || "Logout Gagal! Silakan coba lagi.";
      },
    });
  };

  return (
    <DropdownMenu>
      {/* Trigger: Menggunakan prop render khas Neobrutalism */}
      <DropdownMenuTrigger
        render={
          <Button
            variant="noShadow"
            className="size-10 rounded-full border-2 border-black p-0 overflow-hidden hover:scale-105 active:scale-95 transition-transform"
          />
        }
      >
        <Avatar className="size-full">
          <AvatarFallback className="bg-[#FFDE59] text-black font-black text-xs border-none">{getInitials(user?.name, user?.email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      {/* Content Dropdown */}
      <DropdownMenuContent
        className="w-64 border-2 border-black bg-white p-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg"
        align="end"
        sideOffset={6}
      >
        {/* Info Profil */}
        <DropdownMenuLabel className="p-2 font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border-2 border-black shrink-0">
              <AvatarFallback className="bg-[#A8EB12] text-black font-black text-xs">{getInitials(user?.name, user?.email)}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col space-y-0.5 overflow-hidden">
              <p className="text-sm font-black text-black truncate leading-tight">{user?.name || "User"}</p>
              <p className="text-xs font-mono font-medium text-neutral-600 truncate">{user?.email || "user@example.com"}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-black h-[2px] my-1" />

        {/* Tombol Logout */}
        <DropdownMenuItem
          disabled={isLoading}
          closeOnClick={false}
          onClick={handleSignOut}
          className="cursor-pointer font-black text-red-600 gap-2 py-2 focus:bg-red-50 focus:text-red-700 rounded"
        >
          <LogOut className="size-4 stroke-[2.5]" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
