"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Copy, ExternalLink, MoreHorizontal } from "lucide-react";

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

import { getFullShortUrl } from "./lib";
import { type DataTableFeatures } from "./data-table-features";
import type { UrlItem } from "./types";

const columnHelper = createColumnHelper<DataTableFeatures, UrlItem>();

export const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="data-checked:bg-secondary-background data-indeterminate:bg-secondary-background"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="data-checked:bg-secondary-background data-indeterminate:bg-secondary-background"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={`Select URL ${row.original.id}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
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
          <span className="truncate">{fullUrl}</span>
          <ExternalLink className="size-3 shrink-0 opacity-60" />
        </a>
      );
    },
  }),
  columnHelper.accessor("originalUrl", {
    header: "Destination Link",
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
            <span className="sr-only">Open actions menu</span>
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                void navigator.clipboard.writeText(new URL(fullUrl, window.location.origin).toString());
              }}
            >
              <Copy className="mr-2 size-4" />
              Copy Short Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.open(item.originalUrl, "_blank", "noopener,noreferrer")}>Visit Original Link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  }),
]);
