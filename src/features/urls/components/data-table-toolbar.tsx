"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { CheckCircle2Icon, LoaderCircleIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { DEFAULT_PAGE } from "@/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { useUrlsFilter } from "../hooks/use-urls-filter";

import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "@/components/ui/toast";

export const createUrlSchema = z.object({
  originalUrl: z.string().trim().min(1, "Original URL wajib diisi.").url("Masukkan format URL yang valid (contoh: https://...)"),
  uniquePath: z
    .string()
    .trim()
    .max(64, "Path maksimal 64 karakter.")
    .regex(/^[a-zA-Z0-9_-]*$/, "Hanya boleh huruf, angka, strip (-), dan underscore (_).")
    .optional()
    .or(z.literal("")),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;

export function DataTableToolbar() {
  const [filters, setFilters] = useUrlsFilter();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [open, setOpen] = useState(false);

  // Debounce untuk Search Toolbar
  const debouncedSearch = useDebounce(searchValue, 350);

  // State untuk Custom Path Input & Debounce check
  const [customPathInput, setCustomPathInput] = useState("");
  const debouncedPathToCheck = useDebounce(customPathInput.trim(), 400);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Query ketersediaan path unik (otomatis refetch setiap debouncedPathToCheck berubah)
  const isPathValidFormat = /^[a-zA-Z0-9_-]{1,64}$/.test(debouncedPathToCheck);

  const {
    data: checkData,
    isLoading: isCheckingPath,
    isFetching: isRefetchingPath,
  } = useQuery({
    ...trpc.urls.checkUniquePath.queryOptions({
      uniquePath: debouncedPathToCheck,
    }),
    enabled: isPathValidFormat && open,
    staleTime: 0, // Jangan gunakan cache kadaluarsa agar selalu cek ulang saat teks diganti
  });

  // Nilai ketersediaan path dari response query
  const isAvailable = typeof checkData === "boolean" ? checkData : (checkData as { isAvailable?: boolean } | undefined)?.isAvailable;

  const isPathChecking = (customPathInput.trim() !== debouncedPathToCheck && customPathInput.trim().length > 0) || isCheckingPath || isRefetchingPath;

  // Mutation untuk create shortlink
  const createMutation = useMutation(
    trpc.urls.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.urls.getAll.queryFilter());
        toast.add({
          title: "Shortlink berhasil dibuat!",
          type: "success",
        });
        setOpen(false);
        form.reset();
        setCustomPathInput("");
      },
      onError: (error) => {
        toast.add({
          title: "Gagal membuat shortlink",
          description: "Terjadi kesalahan saat membuat shortlink.",
          type: "error",
        });
      },
    }),
  );

  // Sync state search filter
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

  const isAnyFilterModified = !!filters.search;

  const onClearFilters = () => {
    setSearchValue("");
    setFilters({
      search: "",
      page: DEFAULT_PAGE,
    });
  };

  const form = useForm({
    defaultValues: {
      originalUrl: "",
      uniquePath: "",
    },
    onSubmit: async ({ value }) => {
      if (value.uniquePath.trim() && isAvailable === false) {
        return;
      }

      const parse = createUrlSchema.safeParse(value);
      if (!parse.success) return;

      await createMutation.mutateAsync({
        originalUrl: value.originalUrl.trim(),
        uniquePath: value.uniquePath.trim() || undefined,
      });
    },
  });

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      {/* Search Bar */}
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter original URL..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="max-w-sm"
          aria-label="Filter original URLs"
        />

        {isAnyFilterModified && (
          <Button
            variant="neutral"
            onClick={onClearFilters}
            className="h-8 px-2"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Modal Dialog Create */}
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            form.reset();
            setCustomPathInput("");
            createMutation.reset();
          }
        }}
      >
        <DialogTrigger
          render={
            <Button variant="neutral">
              <PlusIcon className="mr-1 size-4" />
              Create Link
            </Button>
          }
        ></DialogTrigger>

        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Shortlink</DialogTitle>
            <DialogDescription>Masukkan URL tujuan dan custom path jika diperlukan.</DialogDescription>
          </DialogHeader>

          <form
            id="create-url-form"
            className="grid gap-5"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            {/* Field: Original URL */}
            <form.Field
              name="originalUrl"
              validators={{
                onChange: ({ value }) => {
                  const res = createUrlSchema.shape.originalUrl.safeParse(value);
                  return res.success ? undefined : res.error.issues[0]?.message;
                },
              }}
            >
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <div className="grid gap-2">
                    <label
                      htmlFor={field.name}
                      className="text-sm font-medium"
                    >
                      Original URL
                    </label>

                    <Input
                      id={field.name}
                      name={field.name}
                      type="url"
                      placeholder="https://example.com/page"
                      autoComplete="url"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />

                    {isInvalid && <p className="text-sm text-destructive">{field.state.meta.errors.map(String).join(", ")}</p>}
                  </div>
                );
              }}
            </form.Field>

            {/* Field: Custom Path */}
            <form.Field
              name="uniquePath"
              validators={{
                onChange: ({ value }) => {
                  const res = createUrlSchema.shape.uniquePath.safeParse(value);
                  return res.success ? undefined : res.error.issues[0]?.message;
                },
              }}
            >
              {(field) => {
                const isSchemaInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const isPathTaken = customPathInput.trim().length > 0 && !isPathChecking && isAvailable === false;
                const isPathReady = customPathInput.trim().length > 0 && !isPathChecking && !isSchemaInvalid && isAvailable === true;

                return (
                  <div className="grid gap-2">
                    <label
                      htmlFor={field.name}
                      className="text-sm font-medium"
                    >
                      Custom path
                      <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                    </label>

                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="my-shortlink"
                      maxLength={64}
                      autoComplete="off"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.handleChange(val);
                        setCustomPathInput(val); // Trigger debounce baru setiap ketikan
                      }}
                      aria-invalid={isSchemaInvalid || isPathTaken}
                    />

                    <div
                      className="min-h-5 text-xs"
                      aria-live="polite"
                    >
                      {/* Sedang debounce atau fetching backend */}
                      {isPathChecking && (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <LoaderCircleIcon className="size-3.5 animate-spin" />
                          Memeriksa ketersediaan path...
                        </span>
                      )}

                      {/* Error validasi regex/karakter */}
                      {!isPathChecking && isSchemaInvalid && <p className="text-destructive">{field.state.meta.errors.map(String).join(", ")}</p>}

                      {/* Path bentrok / sudah terpakai */}
                      {!isPathChecking && !isSchemaInvalid && isPathTaken && (
                        <p className="text-destructive font-medium">Path sudah digunakan, silakan pilih path lain.</p>
                      )}

                      {/* Path tersedia */}
                      {!isPathChecking && isPathReady && (
                        <span className="flex items-center gap-1.5 text-green-600 font-medium">
                          <CheckCircle2Icon className="size-3.5" />
                          Path tersedia!
                        </span>
                      )}

                      {/* Keterangan default jika kosong */}
                      {!customPathInput && <span className="text-muted-foreground">Kosongkan untuk menggunakan path acak otomatis.</span>}
                    </div>
                  </div>
                );
              }}
            </form.Field>

            {createMutation.isError && (
              <p className="text-sm text-destructive font-medium">{createMutation.error.message || "Gagal membuat shortlink."}</p>
            )}
          </form>

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="neutral"
                >
                  Cancel
                </Button>
              }
            ></DialogClose>

            <form.Subscribe
              selector={(state) => ({
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ isSubmitting }) => (
                <Button
                  type="submit"
                  form="create-url-form"
                  disabled={
                    isSubmitting || isPathChecking || (customPathInput.trim().length > 0 && isAvailable === false) || createMutation.isPending
                  }
                >
                  {createMutation.isPending || isSubmitting ? "Creating..." : "Create Shortlink"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
