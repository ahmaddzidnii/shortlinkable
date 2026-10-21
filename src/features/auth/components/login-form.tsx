"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Bungkus proses login agar bisa melempar error ke toast.promise
    const loginAction = async () => {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res.error) {
        throw new Error(res.error.message || "Email atau password yang kamu masukkan salah.");
      }

      return res.data;
    };

    // 2. Jalankan toast.promise dan lakukan redirect di callback success
    toast.promise(loginAction(), {
      loading: "Memproses login...",
      success: () => {
        setIsLoading(false);

        // Redirect ke dashboard / manage
        router.push("/manage");
        router.refresh(); // Pastikan Server Components membaca sesi terbaru

        return "Login Berhasil! Mengalihkan...";
      },
      error: (err: Error) => {
        setIsLoading(false);
        return err.message || "Login Gagal! Periksa kembali kredensial kamu.";
      },
    });
  };

  return (
    <Card className="w-full max-w-md rounded-xl border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between border-b-4 border-black bg-[#FAF8F5] px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full border-2 border-black bg-[#FF6B6B]" />
          <span className="size-3 rounded-full border-2 border-black bg-[#FFDE59]" />
          <span className="size-3 rounded-full border-2 border-black bg-[#70E000]" />
        </div>
      </div>

      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-3xl font-black uppercase tracking-tight">Sign In</CardTitle>
        <CardDescription className="text-sm font-semibold text-neutral-700">Masukkan email dan password untuk masuk ke akun kamu.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-black"
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
              className="h-11 bg-white font-medium placeholder:text-neutral-400 focus-visible:bg-[#FFFDF5] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-black"
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
              className="h-11 bg-white font-medium placeholder:text-neutral-400 focus-visible:bg-[#FFFDF5] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full cursor-pointer border-[3px] border-black bg-[#FFDE59] text-base font-extrabold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#FCD34D] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            {isLoading ? "Signing in..." : "Masuk Sekarang"}
            <ArrowRight className="size-4 stroke-[2.5]" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
