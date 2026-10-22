"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_PAGE } from "@/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { useUrlsFilter } from "../hooks/use-urls-filter";
import { CreateUrlDialog } from "./create-url-dialog";

export function DataTableToolbar() {
  const [filters, setFilters] = useUrlsFilter();
  const [searchValue, setSearchValue] = useState(filters.search);

  const debouncedSearch = useDebounce(searchValue, 350);

  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({
        search: debouncedSearch,
        page: DEFAULT_PAGE,
      });
    }
  }, [debouncedSearch, filters.search, setFilters]);

  const onClearFilters = () => {
    setSearchValue("");
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });
  };

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter original URL..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="max-w-sm"
          aria-label="Filter original URLs"
        />

        {!!filters.search && (
          <Button
            variant="neutral"
            onClick={onClearFilters}
            className="h-8 px-2"
          >
            Clear
          </Button>
        )}
      </div>
      <CreateUrlDialog />
    </div>
  );
}
