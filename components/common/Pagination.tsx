import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

function buildPageUrl(
  basePath: string,
  page: number,
  searchParams: Record<string, string>
): string {
  const params = new URLSearchParams({ ...searchParams, page: String(page) });
  return `${basePath}?${params.toString()}`;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Generate page numbers to show (window of 5 around current page)
  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  const pages = getPages();

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-10"
      aria-label="Pagination"
    >
      {/* Previous */}
      {hasPrev ? (
        <Link
          href={buildPageUrl(basePath, prevPage, searchParams)}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Précédent</span>
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-300 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Précédent</span>
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="px-3 py-2 text-sm text-slate-400">
              …
            </span>
          ) : (
            <Link
              key={page}
              href={buildPageUrl(basePath, page, searchParams)}
              className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                page === currentPage
                  ? "text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              style={
                page === currentPage
                  ? { backgroundColor: "var(--color-brand-green)" }
                  : {}
              }
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {/* Next */}
      {hasNext ? (
        <Link
          href={buildPageUrl(basePath, nextPage, searchParams)}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Page suivante"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-300 cursor-not-allowed">
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
