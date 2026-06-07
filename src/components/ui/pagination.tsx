import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="p-4 bg-muted/50 border-t border-border flex justify-between items-center">
      <p className="typo-label-md text-muted-foreground">
        Mostrando {from}-{to} de {totalItems} propiedades
      </p>
      <div className="flex gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Página anterior"
          className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="chevron_left" size={20} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "px-3 py-1.5 rounded-lg font-bold typo-label-md transition-colors",
              page === currentPage
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Página siguiente"
          className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="chevron_right" size={20} />
        </button>
      </div>
    </div>
  );
}
