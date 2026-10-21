import { Button } from "@/components/ui/button";

interface DataPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  duration?: number;
  onPageChange: (page: number) => void;
}

export const DataPagination = ({ page, pageSize, total, totalPages, duration, onPageChange }: DataPaginationProps) => {
  const startRecord = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-end gap-2 py-4">
      <div className="flex-1 text-sm text-foreground">
        Menampilkan {startRecord}–{endRecord} dari {total} data
        {duration !== undefined && <span className="ml-2 text-muted-foreground">· {duration} ms</span>}
      </div>

      <Button
        variant="noShadow"
        className="bg-secondary-background text-foreground"
        size="sm"
        disabled={page <= 1 || totalPages === 0}
        onClick={() => onPageChange(Math.max(1, page - 1))}
      >
        Previous
      </Button>

      <Button
        variant="noShadow"
        className="bg-secondary-background text-foreground"
        size="sm"
        disabled={page >= totalPages || totalPages === 0}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      >
        Next
      </Button>
    </div>
  );
};
