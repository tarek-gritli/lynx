import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FiltersBar } from "@/components/history/filters-bar";
import { HistoryHeader } from "@/components/history/history-header";
import { MoreFiltersSheet } from "@/components/history/more-filters-sheet";
import { Pagination } from "@/components/history/pagination";
import { ReviewsTable } from "@/components/tables/reviews-table";
import type { ReviewFilters, ReviewStatus } from "@/hooks/use-reviews";
import { useReviews } from "@/hooks/use-reviews";

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus | "all">(
    "all",
  );
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<
    Partial<ReviewFilters>
  >({});

  const allFilters: Partial<ReviewFilters> = {
    repo_name: searchQuery || undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    ...advancedFilters,
  };

  const { reviews, pagination, isLoading } = useReviews({
    page,
    limit: 10,
    filters: allFilters,
  });

  const handleApplyAdvancedFilters = (filters: Partial<ReviewFilters>) => {
    setAdvancedFilters(filters);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleStatusChange = (status: ReviewStatus | "all") => {
    setSelectedStatus(status);
    setPage(1);
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <HistoryHeader totalReviews={pagination?.total ?? 0} />

      <FiltersBar
        searchQuery={searchQuery}
        selectedStatus={selectedStatus}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onMoreFiltersClick={() => setMoreFiltersOpen(true)}
      />

      <ReviewsTable
        reviews={reviews}
        isLoading={isLoading}
        emptyMessage={
          searchQuery || selectedStatus !== "all"
            ? "No reviews match your filters"
            : "No reviews found. Start by integrating a repository."
        }
      />

      {pagination && pagination.pages > 1 && (
        <Pagination pagination={pagination} onPageChange={setPage} />
      )}

      <MoreFiltersSheet
        open={moreFiltersOpen}
        onOpenChange={setMoreFiltersOpen}
        filters={advancedFilters}
        onApplyFilters={handleApplyAdvancedFilters}
      />
    </main>
  );
}
