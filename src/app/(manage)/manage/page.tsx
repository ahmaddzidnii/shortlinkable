import { SearchParams } from "nuqs";

import { UrlsView } from "@/features/urls/components/urls-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { loadSearchParams } from "@/features/urls/params";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function ManageURLPage({ searchParams }: Props) {
  const filters = await loadSearchParams(searchParams);

  prefetch(
    trpc.urls.getAll.queryOptions({
      ...filters,
    }),
  );
  return (
    <div className="mx-auto px-4 min-[1300px]:px-0  max-w-[1300px] w-full flex flex-col items-center justify-center gap-4">
      <HydrateClient>
        <UrlsView />
      </HydrateClient>
    </div>
  );
}
