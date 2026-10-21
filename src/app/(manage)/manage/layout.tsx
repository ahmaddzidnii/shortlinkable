import Navbar from "@/components/navbar";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { auth } from "@/lib/auth";
import { TRPCReactProvider } from "@/trpc/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
            Built with care by{" "}
            <a
              href="https://ahmadzidni.com"
              target="_blank"
              rel="noreferrer"
            >
              Ahmad Zidni
            </a>
            , for myself.
          </div>
        </footer>
      </TRPCReactProvider>
    </AuthProvider>
  );
}
