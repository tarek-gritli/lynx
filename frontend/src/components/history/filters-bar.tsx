import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReviewStatus } from "@/hooks/use-reviews";

interface FiltersBarProps {
  searchQuery: string;
  selectedStatus: ReviewStatus | "all";
  onSearchChange: (value: string) => void;
  onStatusChange: (status: ReviewStatus | "all") => void;
  onMoreFiltersClick: () => void;
}

const STATUS_FILTERS: { label: string; value: ReviewStatus | "all" }[] = [
  { label: "All Reviews", value: "all" },
  { label: "Completed", value: "success" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

export function FiltersBar({
  searchQuery,
  selectedStatus,
  onSearchChange,
  onStatusChange,
  onMoreFiltersClick,
}: FiltersBarProps) {
  return (
    <div className="bg-card p-4 rounded-t-xl border-x border-t border-border flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          className="pl-10"
          placeholder="Search repository names..."
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => onStatusChange(filter.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                selectedStatus === filter.value
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-background text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="h-8 w-px bg-border hidden md:block mx-1" />
        <Button variant="outline" size="sm" onClick={onMoreFiltersClick}>
          <Filter className="size-4" />
          More Filters
        </Button>
      </div>
    </div>
  );
}
