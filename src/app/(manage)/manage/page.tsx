import DataTableDemo from "@/components/data-table-demo";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="mx-auto max-w-[1300px] w-full flex flex-col items-center justify-center gap-4">
      <DataTableDemo />
    </div>
  );
}
