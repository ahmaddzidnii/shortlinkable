"use client";

import * as React from "react";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Copy, ExternalLink, MoreHorizontal, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "";

export type UrlItem = {
  id: string; // Base62 string representasi dari Bytes
  uniquePath?: string | null;
  originalUrl: string;
};

const getFullShortUrl = (item: UrlItem): string => {
  const path = item.uniquePath || item.id;
  if (BASE_URL) {
    return `${BASE_URL.replace(/\/$/, "")}/${path}`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/${path}`;
  }
  return `/${path}`;
};

const data: UrlItem[] = [
  {
    id: "7aX9bK1",
    uniquePath: "custom-promo",
    originalUrl: "https://ahmadzidni.com/articles/system-design-url-shortener",
  },
  {
    id: "1pq8Z6V",
    uniquePath: null, // Fallback otomatis menggunakan ID Base62
    originalUrl: "https://github.com/ahmadzidni/portfolio-showcase",
  },
];

const features = tableFeatures({
  columnFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  columnVisibilityFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
});

const columnHelper = createColumnHelper<typeof features, UrlItem>();

export const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="data-checked:bg-secondary-background data-indeterminate:bg-secondary-background"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="data-checked:bg-secondary-background data-indeterminate:bg-secondary-background"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  }),
  columnHelper.accessor((row) => getFullShortUrl(row), {
    id: "shortUrl",
    header: "Short Link",
    cell: ({ row }) => {
      const fullUrl = getFullShortUrl(row.original);
      return (
        <a
          href={fullUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          <span>{fullUrl}</span>
          <ExternalLink className="size-3 shrink-0 opacity-60" />
        </a>
      );
    },
  }),
  columnHelper.accessor("originalUrl", {
    header: ({ column }) => (
      <Button
        variant="noShadow"
        className="bg-secondary-background text-foreground"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Original URL
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const url = row.getValue("originalUrl") as string;
      return (
        <div
          className="max-w-[360px] truncate"
          title={url}
        >
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-muted-foreground hover:underline"
          >
            <span className="truncate">{url}</span>
            <ExternalLink className="size-3 shrink-0 opacity-60" />
          </a>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      const fullUrl = getFullShortUrl(item);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="noShadow"
                className="size-8 bg-secondary-background p-0 text-foreground"
              />
            }
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(fullUrl)}>
              <Copy className="mr-2 size-4" /> Copy Short Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.open(item.originalUrl, "_blank")}>Visit Original Link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
]);

export default function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const table = useTable({
    features,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  if (!isMounted) {
    return null;
  }

  return (
    <div className="w-full font-base text-foreground">
      <div className="flex items-center justify-between gap-4 py-4">
        <Input
          placeholder="Filter original URL..."
          value={(table.getColumn("originalUrl")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("originalUrl")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Button variant="neutral">
          <PlusIcon className="mr-1 size-4" />
          Create Link
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="font-heading">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="bg-background text-foreground"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className="text-foreground"
                    key={header.id}
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="bg-background text-foreground data-[state=selected]:bg-main data-[state=selected]:text-main-foreground"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className="px-4 py-2"
                      key={cell.id}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Belum ada URL yang dibuat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="noShadow"
            className="bg-secondary-background text-foreground"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="noShadow"
            className="bg-secondary-background text-foreground"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
