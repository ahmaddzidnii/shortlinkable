import Navbar from "@/components/navbar";

export default function ManageLayout({ children }: LayoutProps<"/manage">) {
  return (
    <>
      <Navbar />
      <div className="flex-1 pt-24">{children}</div>
      <footer className="border-t-4 border-border bg-secondary-background text-center font-base sm:text-base text-sm text-foreground">
        <div className="px-5 py-6">
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
    </>
  );
}
