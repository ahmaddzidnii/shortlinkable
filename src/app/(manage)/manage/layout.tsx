import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { TRPCReactProvider } from "@/trpc/client";
import { AuthProvider } from "@/features/auth/components/auth-provider";

export const dynamic = "force-dynamic";

export default async function ManageLayout({ children }: LayoutProps<"/manage">) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const initialSession = {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
    expiresAt: session.session.expiresAt.getTime(),
  };

  return (
    <AuthProvider initialSession={initialSession}>
      <TRPCReactProvider>
        <Navbar />
        <div className="flex-1 pt-24">{children}</div>
        <footer className="border-t-4 border-border bg-secondary-background text-center font-base sm:text-base text-sm text-foreground">
          <div className="px-4 py-3">
            Crafted by{" "}
            <a
              href="https://ahmadzidni.com"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-primary hover:underline"
            >
              Ahmad Zidni
            </a>
            , Made with purpose.
          </div>
        </footer>
      </TRPCReactProvider>
    </AuthProvider>
  );
}
