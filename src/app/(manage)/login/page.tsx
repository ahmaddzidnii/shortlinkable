import { LoginForm } from "@/features/auth/components/login-form";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/manage");
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#FFF4E0] p-4 font-sans text-black selection:bg-[#FFDE59] selection:text-black sm:p-6">
      <LoginForm />
    </main>
  );
}
