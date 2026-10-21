"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import DataTable from "@/features/urls/components/data-table";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { UrlItem } from "./types";
import { DataTableToolbar } from "./data-table-toolbar";
import { useUrlsFilter } from "../hooks/use-urls-filter";
import { DataPagination } from "@/components/data-pagination";

function UrlsTableContent() {
  const trpc = useTRPC();
  const [filters, setFilters] = useUrlsFilter();

  const { data } = useSuspenseQuery(
    trpc.urls.getAll.queryOptions({
      search: filters.search,
      page: filters.page,
    }),
  );

  const urls: UrlItem[] = data.items.map((d) => ({
    id: d.id,
    originalUrl: d.originalUrl,
    uniquePath: d.uniquePath,
  }));

  return (
    <>
      <DataTable data={urls} />
      <DataPagination
        page={data.pagination.page}
        pageSize={data.pagination.pageSize}
        total={data.pagination.total}
        totalPages={data.pagination.totalPages}
        duration={data.duration}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
    </>
  );
}

export const UrlsView = () => {
  return (
    <div className="w-full">
      <DataTableToolbar />
      <ErrorBoundary fallback={<div className="text-red-500 py-4 font-bold">Error loading URLs</div>}>
        <Suspense fallback={<div className="text-neutral-500 py-4 font-mono font-bold">Loading URLs...</div>}>
          <UrlsTableContent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
