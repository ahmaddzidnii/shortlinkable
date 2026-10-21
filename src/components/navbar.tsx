import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

async function Navbar() {
  return (
    <nav className="fixed left-0 top-0 z-20 mx-auto flex h-[70px] w-full items-center border-b-4 border-border bg-secondary-background px-5">
      <div className="mx-auto flex w-[1300px] text-foreground max-w-full items-center justify-between">
        <div className="flex items-center xl:gap-10 gap-10">
          <Link
            className="flex items-center gap-2 text-2xl font-bold uppercase tracking-wider"
            href={"/manage"}
          >
            <div className="relative size-10 rounded-2xl overflow-hidden">
              <Image
                src="/logo/5.png"
                fill
                alt="logo"
                unoptimized
              />
            </div>
            <span>Links</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* <Search /> */}

          <div className="flex items-center justify-end gap-4">
            <Avatar>
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="@shadcn"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
