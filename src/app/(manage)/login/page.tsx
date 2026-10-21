"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Handle authentication logic di sini
    console.log({ email, password });
  };

  return (
    <main className="min-h-screen w-full bg-[#FFF4E0] text-black font-sans flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-[#FFDE59] selection:text-black">
      <Card className="w-full max-w-md bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Retro Window Dots */}
        <div className="flex items-center justify-between border-b-4 border-black px-6 py-3 bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#FF6B6B] border-2 border-black" />
            <span className="size-3 rounded-full bg-[#FFDE59] border-2 border-black" />
            <span className="size-3 rounded-full bg-[#70E000] border-2 border-black" />
          </div>
        </div>

        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="text-3xl font-black uppercase tracking-tight">Sign In</CardTitle>
          <CardDescription className="text-sm font-semibold text-neutral-700">Masukkan email dan password untuk masuk ke akun kamu.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Field: Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-mono font-black uppercase tracking-wider text-black flex items-center gap-1.5"
              >
                <Mail className="size-3.5 stroke-[2.5]" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 bg-white font-medium placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-[#FFFDF5]"
              />
            </div>

            {/* Field: Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-mono font-black uppercase tracking-wider text-black flex items-center gap-1.5"
              >
                <Lock className="size-3.5 stroke-[2.5]" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 bg-white font-medium placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-[#FFFDF5]"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            {/* Tombol Submit dengan Tactile Feedback */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#FFDE59] hover:bg-[#FCD34D] text-black font-extrabold text-base border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? "Signing in..." : "Masuk Sekarang"}
              <ArrowRight className="size-4 stroke-[2.5]" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
